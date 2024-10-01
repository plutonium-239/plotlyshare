import { strFromU8, strToU8, unzip, zipSync } from "fflate";
import { Node, parseFromString } from "dom-parser";

onmessage = ({ data }) => {
    console.log("received data in worker");
    console.log(data);
    // parser = new DOMParser()

    unzipAndMigrate(data);
}
// let parser: DOMParser


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
                const parsed: {key: string, name: string, plots: {[s: string]: string} | undefined, num_chunks: number | undefined}[] =
                 JSON.parse(strFromU8(unzipped['bases/everything.json']))
                // console.log(parsed);
                // console.log(parsed.find(({key}) => key === 'METADATA')?.plots);
                
                const newMeta = new Map(Object.entries(parsed.find(({key}) => key === 'METADATA')?.plots!))
                const everything = new Map()
                parsed.filter(({key}) => key !== 'METADATA')?.forEach(element => {
                    everything.set(element.key, element)
                });
                // console.log(newMeta);
                postMessage({
                    migrateOutput: `Found ${newMeta.size} plots.`,
                    migrateErrored: false,
                    newMeta: newMeta
                })
                const convertedJSON: {[key: string]: Uint8Array} = {}

                everything.forEach((value, key) => {
                    console.log(value);
                    if (!value.html){
                        try {
                            let drivehtml = unzipped[`drives/lfs/${key}`]
                            value.html = strFromU8(drivehtml)
                        } catch {
                            console.error("No html found for", key);
                            return
                        }
                    } 
                    const plot = parseFromString(value.html)
                    console.log(plot);
                    
                    let graphingscript: Node | undefined
                    for (const sc of plot.getElementsByTagName('script')) {
                        if (sc && sc.innerHTML.includes("Plotly.newPlot"))
                            graphingscript = sc
                    }
                    if (!graphingscript) {
                        console.error("could not find the plotly graph maker script for", key);
                        return
                    } 
                    let script_text = graphingscript.innerHTML.replace(/\s{2,}/g, ' ')
                    script_text = script_text.slice(
                        script_text.indexOf('Plotly.newPlot'), 
                        script_text.lastIndexOf('};')
                    )
                    script_text = script_text.slice(script_text.indexOf('[{'), script_text.lastIndexOf('}') + 1) 
                    let outputs: Array<any>
                    try {
                        outputs = JSON.parse(`[${script_text}]`)
                    } catch {
                        console.error("could not parse the script for", key);
                        console.log("Here is the script:")
                        console.log(script_text);
                        return
                    }
                    if (!(outputs instanceof Array && outputs.length === 3)) {
                        console.error("Did not find data in the correct format", key);
                        console.log("Here is the parsed JSON:")
                        console.log(outputs);
                        return
                    }
                    console.log("Successfully found all data for plot", key);
                    const final = {
                        data: outputs[0],
                        layout: outputs[1],
                        config: outputs[2]
                    }
                    console.log(final);
                    convertedJSON[`${key}.json`] = strToU8(JSON.stringify(final))
                })
                const zip = zipSync(convertedJSON)
                postMessage({
                    migrateErrored: false,
                    migrateOutput: "Successfully converted data",
                    convertedData: new Blob([zip])
                })
            } catch (e: any) {
                console.log("worker errored");
                console.error(e);
            }
        })
    };
    reader.readAsArrayBuffer(zipFile);
}