/**
 * BOM Utilities - Client-side logic for OnShape BOM extraction
 */

/**
 * Extract IDs from OnShape URL
 * @param {string} onshapeURL - Full OnShape URL
 * @returns {Map} Map containing docID, wvmID, elmID
 */
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

/**
 * Fetch BOM JSON from OnShape API
 * @param {string} onshapeURL - Full OnShape URL
 * @returns {Promise<Object>} BOM JSON data
 */
export async function fetchBOMJSON(onshapeURL) {
    const ids = getIDs(onshapeURL);
    const request = `https://cad.onshape.com/api/v15/assemblies/d/${ids.get("docID")}/w/${ids.get("wvmID")}/e/${ids.get("elmID")}/bom?indented=true&multiLevel=true&generateIfAbsent=true&includeItemMicroversions=false&includeTopLevelAssemblyRow=false&thumbnail=false&respectSubassemblyBomBehavior=false`;
    const response = await fetch(request);

    if (!response.ok) {
        throw new Error(`OnShape API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Convert BOM JSON to a row list with header information
 * @param {Object} json - BOM JSON data
 * @returns {Array} Array of row Maps with header values
 */
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

/**
 * Extract specific part information from a BOM row
 * @param {Map} row - BOM row data
 * @returns {Object} Extracted part information
 */
export function extractPartInfo(row) {
    return {
        name: row.get("Name") || "N/A",
        mass: row.get("Mass") || "N/A",
        revision: row.get("Revision") || "N/A",
        description: row.get("Description") || "N/A",
        material: row.get("Material") || "N/A"
    };
}

/**
 * Find a part in the row list by name
 * @param {string} partName - Name of the part to find
 * @param {Array} rowList - Array of BOM rows
 * @returns {Object|null} Part information or null if not found
 */
export function findPartInList(partName, rowList) {
    for (const row of rowList) {
        const name = row.get("Name") || "";
        if (name.toLowerCase() === partName.toLowerCase()) {
            return extractPartInfo(row);
        }
    }
    return null;
}

/**
 * Main function to get part information from OnShape
 * @param {string} onshapeURL - Full OnShape URL
 * @param {string} partName - Name of the part to search for
 * @returns {Promise<Object>} Part information
 */
export async function getPart(onshapeURL, partName) {
    if (!onshapeURL || !partName) {
        throw new Error('Missing required fields: onshapeURL and partName');
    }

    // Fetch BOM data
    const bomJSON = await fetchBOMJSON(onshapeURL);

    // Convert to row list
    const rowList = BOMJSONtoRowList(bomJSON);

    // Find the part
    const partInfo = findPartInList(partName, rowList);

    if (!partInfo) {
        throw new Error(`Part "${partName}" not found in the BOM`);
    }

    return partInfo;
}

