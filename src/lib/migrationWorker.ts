import { strFromU8, strToU8, unzip, zipSync, type Unzipped } from "fflate";
import { Node, parseFromString } from "dom-parser";
import {load as cheerioload} from 'cheerio'

onmessage = ({ data }) => {
    console.log("received data in worker");
    console.log(data);
    // parser = new DOMParser()

    unzipAndMigrate(data);
}
// let parser: DOMParser

type PlotInEverything = {
    key: string, 
    name: string, 
    plots?: {[s: string]: {
        name: string,
        time_created?: string,
        time?: string
        timestamp: number
    }},
    num_chunks?: number
}

function unzipAndMigrate(zipFile: File) { 
    const reader = new FileReader();
    reader.onload = (e) => {
        const zipBytes = new Uint8Array(e.target?.result as ArrayBuffer);
        // Handle the zipBytes (unzip, process files)
        console.log('ZIP file loaded and ready to unzip:', zipBytes);
        unzip(zipBytes, (err, unzipped) => {
            console.log(unzipped);
            
            if (err) {
                console.error(err);
                postMessage({
                    migrateOutput: `Error while decompressing \n:${err.code} ${err.name}\n${err.message}`,
                    migrateErrored: true
                })
                return
            }
            if (!unzipped['bases/everything.json']) {
                postMessage({
                    migrateOutput: "Invalid zip archive. Expected to find 'bases' and 'drives' folders at the root, and 'bases/everything.json' file.",
                    migrateErrored: true
                })
                return
            }
            
            try {
                const parsed: PlotInEverything[] =
                 JSON.parse(strFromU8(unzipped['bases/everything.json']))
                // console.log(parsed);
                // console.log(parsed.find(({key}) => key === 'METADATA')?.plots);
                
                const newMeta = new Map(
                    Object.entries(parsed.find(({key}) => key === 'METADATA')?.plots!)
                    
                )
                // console.log(newMeta);
                
                // newMeta = newMeta.map(([k,v]) => [k, JSON.parse(v)])
                newMeta.forEach((value) => {
                    value.time = value.time_created
                    delete value.time_created
                })
                const everything = new Map()
                parsed.filter(({key}) => key !== 'METADATA')?.forEach(element => {
                    everything.set(element.key, element)
                });
                // console.log(newMeta);
                postMessage({
                    migrateOutput: `Found ${newMeta.size} plots.\nUnzipping and converting...`,
                    migrateErrored: false,
                    newMeta: newMeta
                })
                const convertedJSON: {[key: string]: Uint8Array} = {}

                everything.forEach((value, key) => {
                    if (!value.html) {
                        try {
                            let drivehtml = unzipped[`drives/lfs/${key}`];
                            value.html = strFromU8(drivehtml);
                        } catch {
                            console.error("No html found for", key);
                            console.log(value);
                            return;
                        }
                    }
                    const plot = parseFromString(value.html);
                    let parsed = cheerioload(value.html)
                    let graphingScriptText: string;
                    
                    try {
                        let graphingscript = parsed('script').filter((i, el) => {
                            return parsed(el).text().includes("Plotly.newPlot")
                        })
                        graphingScriptText = parsed(graphingscript).text()
                        if (!graphingScriptText) 
                            throw new Error();
                    }
                    catch {
                        console.log("could not find script with cheerio, trying with dom-parser");

                        try {
                            for (const sc of plot.getElementsByTagName('script')) {
                                if (sc && sc.innerHTML.includes("Plotly.newPlot"))
                                {
                                    graphingScriptText = sc.innerHTML;
                                    break;
                                }
                            }
                        } catch (err) {
                            console.error(err);
                            console.log(key);
                            console.log(value);
                        }
                        // @ts-ignore
                        if (!graphingScriptText)
                        console.error("could not find the plotly graph maker script for", key);
                        return;
                    }
                    getPlotFrom(graphingScriptText, convertedJSON, key)
                })
                const zip = zipSync(convertedJSON)
                postMessage({
                    migrateErrored: false,
                    migrateOutput: "Successfully converted data",
                    convertedData: new Blob([zip]),
                })
            } catch (e: any) {
                console.log("worker errored");
                console.error(e);
            }
        })
    };
    reader.readAsArrayBuffer(zipFile);
}

function getPlotFrom(
    graphingScriptText: string, 
    convertedJSON: { [key: string]: Uint8Array; },
    key: any
): void {
    let script_text = graphingScriptText.replace(/\s{2,}/g, ' ');
    script_text = script_text.slice(
        script_text.indexOf('Plotly.newPlot'),
        script_text.lastIndexOf('};')
    );
    script_text = script_text.slice(script_text.indexOf('[{'), script_text.lastIndexOf('}') + 1);
    let outputs: Array<any>;
    try {
        outputs = JSON.parse(`[${script_text}]`);
    } catch {
        console.error("could not parse the script for", key);
        console.log("Here is the script text:");
        console.log({original: graphingScriptText, parsedAttempt: script_text});
        return;
    }
    if (!(outputs instanceof Array && outputs.length === 3)) {
        console.error("Did not find data in the correct format", key);
        console.log("Here is the parsed JSON:");
        console.log(outputs);
        return;
    }
    // console.log("Successfully found all data for plot", key);
    const final = {
        data: outputs[0],
        layout: outputs[1],
        config: outputs[2]
    };
    // console.log(final);
    convertedJSON[`${key}.json`] = strToU8(JSON.stringify(final));
};
