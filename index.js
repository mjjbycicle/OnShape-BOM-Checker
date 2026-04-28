import fs from "fs"

function getIDs(onshapeURL) {
    const docIDre = new RegExp("/documents/[a-zA-Z0-9]+/");
    const wvmIDre = new RegExp("/w/[a-zA-Z0-9]+/");
    const elmIDre = new RegExp("/e/[a-zA-Z0-9]+");
    const docID = onshapeURL.match(docIDre).pop().slice(11).replace('/', '');
    const wvmID = onshapeURL.match(wvmIDre).pop().slice(3).replace('/', '');
    const elmID = onshapeURL.match(elmIDre).pop().slice(3).replace('/', '');
    const res = new Map();
    res.set("docID", docID);
    res.set("wvmID", wvmID);
    res.set("elmID", elmID);
    return res;
}

async function fetchBOMJSON(onshapeURL) {
    const ids = getIDs(onshapeURL);
    const request = `https://cad.onshape.com/api/v15/assemblies/d/${ids.get("docID")}/w/${ids.get("wvmID")}/e/${ids.get("elmID")}/bom?indented=true&multiLevel=true&generateIfAbsent=true&includeItemMicroversions=false&includeTopLevelAssemblyRow=false&thumbnail=false&respectSubassemblyBomBehavior=false`;
    const response = await fetch(request);
    return await response.json();
}

async function saveBOMJSON(onshapeURL) {
    const json = await fetchBOMJSON(onshapeURL);
    const name = json.name.replace("BOM : ", "");
    fs.writeFile("res/" + name + '.json', JSON.stringify(json, null, 2), (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('Successfully wrote to data.json');
        }
    });
}

async function getJSONFromName(name) {
    const rawData = fs.readFileSync("res/" + name + '.json');
    return JSON.parse(rawData.toString());
}

function BOMJSONtoRowList(json) {
    const headersMap = new Map();
    const headers = json.headers;
    for (const header of headers) {
        if (!header.visible) continue;
        const name = header.name;
        const id = header.id;
        headersMap.set(id, name);
    }
    const rows = json.rows;
    const rowList = [];
    for (const row of rows) {
        const rowHeaders = row.headerIdToValue;
        const indentLevel = row.indentLevel;
        const rowMap = new Map();
        for (const headerID of headersMap.keys()) {
            const headerName = headersMap.get(headerID);
            rowMap.set(headerName, rowHeaders[headerID]);
        }
        rowMap.set("indentLevel", indentLevel);
        rowMap.set("rowId", row.id);
        rowList.push(rowMap);
    }
    return rowList;
}

function rowListToMap(rowList) {
    const res = new Map();
}

// await saveBOMJSON("https://cad.onshape.com/documents/2349b31355d5aff1d49308fd/w/7aaaa05611303a287bccdc6e/e/1bdff1f090eef82a2afdd829")
rowListToMap(BOMJSONtoRowList(await getJSONFromName("Beta")));