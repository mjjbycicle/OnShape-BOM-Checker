function getIDs(onshapeURL) {
    const docIDre = new RegExp("//documents//[a-zA-Z0-9]+//");
    const wvmIDre = new RegExp("//w//[a-zA-Z0-9]+//");
    const elmIDre = new RegExp("//e//[a-zA-Z0-9]+//");
    const docID = onshapeURL.match(docIDre);
    const wvmID = onshapeURL.match(wvmIDre);
    const elmID = onshapeURL.match(elmIDre);
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
    const data = await response.json();
    return data;
}