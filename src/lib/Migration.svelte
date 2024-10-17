<script lang="ts">
    import { loggedIn } from './data';
    import ChevronRightIcon from './icons/chevron-right.svg?raw'
    import migrationWorker from './migrationWorker?worker'
    
    let migrateCollapseOpen = false
    let migrateFileChosen: FileList
    let migrateOutput = ""
    let migrateErrored = false
    let migrateDownload: HTMLAnchorElement
    let migratedBlob: Blob
    let migratedMeta: Map<string, string>

    $: console.log('migration:', migrateFileChosen, migrateFileChosen?.length ?? "-1");

    $: if (migrateFileChosen) metaMigrator()

    function metaMigrator() {
        migrateErrored = false
        if (!migrateFileChosen || migrateFileChosen.length > 1) {
            console.log(migrateFileChosen, migrateFileChosen.length);
            
            migrateOutput = "Please upload exactly 1 file"
            migrateErrored = true
            return
        }
        const zipFile = migrateFileChosen[0];
        const worker = new migrationWorker()

        worker.onmessage = ({data}) => {
            if (data.tryWithDOMParser) {

            }
            migrateErrored = data.migrateErrored
            migrateOutput = data.migrateOutput
            if (!migrateErrored) {
                if (data.newMeta) {
                    console.log("RECEIVED NEW META");
                    console.log(data.newMeta);
                    migratedMeta = data.newMeta
                } else {
                    console.log("RECEIVED ZIP DATA");
                    console.log(data.convertedData);

                    migratedBlob = data.convertedData
                    // let blob = new Blob([data.convertedData]);
                    migrateDownload.href = URL.createObjectURL(data.convertedData);
                    migrateDownload.download = `converted${migrateFileChosen[0].name.replace("zip", "")}.zip`;
                    // migrateDownload.click();
                }
            }
        }
        
        worker.postMessage(zipFile)        
    }

    $: if (migratedBlob) {        
        console.log("blob size of zip is", migratedBlob.size);
        
    }

    let uploaded = false
    async function uploadMigrated() {

        if (!migratedBlob || uploaded) return
        console.log("UPLOADING");
        let coll = {
            name: 'migrated from plotlyshare v1 (on deta space)',
            members: [...migratedMeta.keys()],
            subcollections: [],
            public: false,
        }
        let formData = new FormData()
        formData.set('zipped', migratedBlob)
        formData.set('collection', JSON.stringify(coll))
        formData.set('plots', JSON.stringify(Object.fromEntries(migratedMeta)))
        
        console.log('plots')
        console.log(Object.fromEntries(migratedMeta));
        console.log('collection');
        console.log(coll);
        
        

        let res = await fetch('/api/batchupload',
            {
                method: 'POST',
                body: formData
            }
        )
    }
    
</script>

<div class="collapse bg-base-200 overflow-y-clip">
    <input type="checkbox" bind:checked={migrateCollapseOpen} />
    <div class="collapse-title text-xl font-medium flex gap-4 items-center">
        <div class="w-8 h-8 transition-transform duration-150" class:rotate-90={migrateCollapseOpen}>
                {@html ChevronRightIcon}
        </div>
        <p>Migrate from plotlyshare v1 (on deta.space)</p>
    </div>
    <div class="collapse-content flex flex-col items-center">
        <div class="text-secondary text-sm font-semibold w-fit rounded p-1 mb-4">
            Upload your <code>.zip</code> exported from space
            <!-- <button class="btn btn-primary">Upload</button> -->
        </div>
        <input type="file" accept=".zip" bind:files={migrateFileChosen} 
        class="file-input file-input-bordered file-input-secondary file-input-lg w-full" />
        <div class="text-base whitespace-pre-wrap p-2 m-4 rounded {migrateErrored? "bg-error text-error-content": "bg-success text-success-content"}"
            class:hidden={!migrateOutput} class:skeleton={!migratedBlob}
        >
            {migrateOutput}
        </div>
        <div class="w-full join">
        {#if migratedMeta}
            {#if migratedBlob}
                <span class="w-1/2 tooltip tooltip-error tooltip-matchwidth" 
                    data-tip={$loggedIn ? "A new collection will be created for your migrated plots" : "You must be logged in to upload your old plots."}>
                    <button disabled={!$loggedIn} class="w-full btn join-item btn-primary" on:click={uploadMigrated}>Upload</button>
                </span>
            {/if}
            <a class="btn btn-accent join-item w-1/2" class:hidden={!migratedBlob} href="" bind:this={migrateDownload}>
                Download converted data as .zip
            </a>
        {/if}
        </div>
    </div>
</div> 

<style type="postcss">
    .tooltip-matchwidth::before {
        @apply w-full;
    }
</style>