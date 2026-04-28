import fs from "fs"

export function getIDs(onshapeURL) {
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

export async function fetchBOMJSON(onshapeURL) {
    const ids = getIDs(onshapeURL);
    const request = `https://cad.onshape.com/api/v15/assemblies/d/${ids.get("docID")}/w/${ids.get("wvmID")}/e/${ids.get("elmID")}/bom?indented=true&multiLevel=true&generateIfAbsent=true&includeItemMicroversions=false&includeTopLevelAssemblyRow=false&thumbnail=false&respectSubassemblyBomBehavior=false`;
    const response = await fetch(request);
    return await response.json();
}

export async function saveBOMJSON(onshapeURL) {
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

export async function getJSONFromName(name) {
    const rawData = fs.readFileSync("res/" + name + '.json');
    return JSON.parse(rawData.toString());
}

export function BOMJSONtoRowList(json) {
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

export function rowListToMap(rowList) {
    const res = new Map();
    const consecutiveIndentLevelRows = [];
    let currIndentLevel = -1;
    let indentRows = [];
    for (const row of rowList) {
        const indentLevel = row.get("indentLevel");
        if (currIndentLevel === -1) {
            currIndentLevel = indentLevel;
            indentRows.push(row);
        } else if (currIndentLevel !== indentLevel) {
            consecutiveIndentLevelRows.push(indentRows);
            indentRows = [row];
            currIndentLevel = indentLevel;
        } else {
            indentRows.push(row);
        }
    }
    consecutiveIndentLevelRows.push(indentRows);
    let prevIndentRows = new Map();
    for (const indentRows of consecutiveIndentLevelRows) {
        const indentLevel = indentRows[0].get("indentLevel");
        if (indentLevel === 0) {
            for (const row of indentRows) {
                res.set(row.get("Name"), row);
            }
        } else {
            if (prevIndentRows.get(indentLevel - 1).has("children")) {
                prevIndentRows.get(indentLevel - 1).set("children",
                    prevIndentRows.get(indentLevel - 1).get("children").concat(indentRows));
            } else {
                prevIndentRows.get(indentLevel - 1).set("children", indentRows);
            }
        }
        prevIndentRows.set(indentLevel, indentRows[indentRows.length - 1]);
    }
    return res;
}