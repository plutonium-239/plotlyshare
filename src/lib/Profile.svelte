<script lang="ts">
    import { forceDarkPlots, loggedIn, profile, type ProfileAPIResponse, type ProfileData } from './data';
    import ProfileIcon from './icons/profile-default.svg?raw'
    import ChevronRightIcon from './icons/chevron-right.svg?raw'
    import MoonIcon from './icons/moon.svg?raw'
    import SunIcon from './icons/sun.svg?raw'
    import CopyIcon from './icons/copy.svg?raw'
    import EyeHiddenIcon from './icons/eye-hidden.svg?raw'
    import EyeVisibleIcon from './icons/eye-visible.svg?raw'
    import migrationWorker from './migrationWorker?worker'
    let profile_modal: HTMLDialogElement;

    // let profile: ProfileAPIResponse
    let migrateCollapseOpen = false
    let migrateFileChosen: FileList
    let migrateOutput = ""
    let migrateErrored = false
    let migrateDownload: HTMLAnchorElement
    let cliTokenShown = false
    let tokenRegenerated = false
    
    // let it be async, dont await
    let profilePromise = fetch('/api/auth/profile').then((res) => res.json()).then((data) => {
        $profile = data as ProfileAPIResponse;
        $loggedIn = true;
        console.log("LOGGED IN");
        console.log($profile);
    }).catch(() => {
        $loggedIn = false;
        $profile = {uid: 'demo_plots'} as ProfileAPIResponse
        console.log("NOT LOGGED IN");
    });

    $: console.log('migration:', migrateFileChosen, migrateFileChosen?.length ?? "-1");

    $: if (migrateFileChosen) metaMigrator()

    const metaMigrator = () => {
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
            migrateErrored = data.migrateErrored
            migrateOutput = data.migrateOutput
            if (!migrateErrored) {
                if (data.newMeta) {
                    console.log("RECEIVED NEW META");
                    console.log(data.newMeta);
                } else {
                    console.log("RECEIVED ZIP DATA");
                    console.log(data.convertedData);
                    
                    // let blob = new Blob([data.convertedData]);
                    migrateDownload.href = URL.createObjectURL(data.convertedData);
                    migrateDownload.download = `converted${migrateFileChosen[0].name.replace("zip", "")}.zip`;
                    // migrateDownload.click();
                }
            }
        }
        
        worker.postMessage(zipFile)        
    }
    $: uid_token = `${$profile.uid}//${$profile.cli_token}`

    async function regenerateCLIToken() {
        if (!tokenRegenerated) {
            // to reduce frequency
            tokenRegenerated = true
            await fetch('/api/auth/regen_cli_token')
            .then(res => res.json())
            .then(res => {
                $profile.cli_token = (res as {cli_token:string}).cli_token
            })
        }
    }

</script>

<button on:click={() => profile_modal.showModal()} class="btn btn-circle btn-accent w-12">
    {@html ProfileIcon}
</button>
<dialog bind:this={profile_modal} class="modal" id="profile_modal">
    <div class="modal-box flex flex-col items-center">
        <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        {#await profilePromise then }
        {#if $loggedIn}
        <div class="w-48 h-48 m-5 relative flex items-center justify-center">
            <img class="z-10 absolute top-0 left-0 w-full blur-lg rounded-full" src={$profile.picture} aria-hidden="true" alt="blur backdrop" />
            <img class="z-20 rounded-full shadow-[black] shadow-lg" src={$profile.picture} alt="profile"/>
        </div>
        <h3 class="text-lg font-bold">Hello {$profile.name}!</h3>
        <a class="btn btn-error btn-outline mt-4" href="/api/auth/logout">Log Out</a>

        <div class="divider text-primary">CLI Token</div>
        <div class="join join-vertical w-full">
            <div class="text-base join-item bg-base-200 rounded-xl p-2 text-center w-full flex justify-between items-center relative">
                <input 
                    type="checkbox" bind:checked={cliTokenShown}
                    class="absolute w-full h-full left-0 top-0 opacity-0 cursor-pointer" 
                />
                <label class="swap z-10">
                    <input type="checkbox" bind:checked={cliTokenShown}/>
                    <div class="swap-off h-10 w-10">
                        {@html EyeHiddenIcon}
                    </div>
                    <div class="swap-on h-10">
                        {@html EyeVisibleIcon}
                    </div>
                </label>
                <div class:hidden={!cliTokenShown} class="px-4 break-all">
                    {uid_token}
                </div>
                <button 
                    class="z-10 btn btn-outline btn-accent p-0.5 min-h-0 w-10 h-10 clicked-success" 
                    on:click={() => navigator.clipboard.writeText(uid_token)}
                >
                    {@html CopyIcon}
                </button>

            </div>
            <div class="collapse transition-opacity duration-150 {cliTokenShown? "collapse-open opacity-1":"opacity-0"} bg-primary join-item p-2 rounded w-full text-sm">
                <div class="collapse-content text-info-content flex flex-col">
                    <div>
                        Run <code class="bg-base-300/25 rounded p-1">python -m plotlyshare</code> and paste this value there!
                    </div>
                    <button disabled={tokenRegenerated} class="btn btn-error ml-auto" on:click={regenerateCLIToken}>Regenerate token</button>
                </div>
            </div>
        </div>
        
        
        {:else}


        <div class="w-48 h-fit btn btn-accent btn-circle">{@html ProfileIcon}</div>
        <a class="btn btn-primary mt-4" href="/api/auth/google/redirect">Log In</a>
        
        <!-- <div class="divider text-primary">CLI Token</div>
        <div class="join join-vertical w-full">
            <div class="text-base join-item bg-base-200 rounded-xl p-2 text-center w-full flex justify-between items-center relative">
                <input 
                    type="checkbox" bind:checked={cliTokenShown}
                    class="absolute w-full h-full left-0 top-0 opacity-0 cursor-pointer" 
                />
                <label class="swap z-10">
                    <input type="checkbox" bind:checked={cliTokenShown}/>
                    <div class="swap-off h-10 w-10">
                        {@html EyeHiddenIcon}
                    </div>
                    <div class="swap-on h-10 w-10">
                        {@html EyeVisibleIcon}
                    </div>
                </label>
                <div class:hidden={!cliTokenShown}>
                    {"0312f5af-33cf-428c-b2b1-11aa6fc739f6"}
                </div>
                <button 
                    class="z-10 btn btn-outline btn-accent p-0.5 min-h-0 w-10 h-10 clicked-success" 
                    on:click={() => navigator.clipboard.writeText("0312f5af-33cf-428c-b2b1-11aa6fc739f6")}
                >
                    {@html CopyIcon}
                </button>
            </div>
            <div class="collapse transition-opacity duration-150 {cliTokenShown? "collapse-open opacity-1":"opacity-0"} bg-primary join-item p-2 rounded w-full text-sm">
                <div class="collapse-content text-info-content flex flex-col">
                    <div>
                        Run <code class="bg-base-300/25 rounded p-1">python -m plotlyshare</code> and paste this value there!
                    </div>
                    <button class="btn btn-error ml-auto" on:click={regenerateCLIToken}>Regenerate token</button>
                </div>
            </div>
        </div> -->
        
        {/if}
        {/await}
        
        <div class="divider text-accent">Preferences</div>

        <div class="form-control">
            <label class="cursor-pointer label gap-4">
                <span class="text-base">Force Dark Mode on Plots</span>
                <!-- <input type="checkbox" checked="checked" class="checkbox checkbox-accent" /> -->
                <label class="swap swap-flip">
                    <input type="checkbox" bind:checked={$forceDarkPlots} />
                    <span class="swap-on h-10 w-10">
                        {@html MoonIcon}
                    </span>
                    <span class="swap-off h-10 w-10">
                        {@html SunIcon}
                    </span>
                </label>
            </label>
        </div>

        <div class="divider text-secondary">Migrate old plots</div>
        
        <!-- MIGRATION -->
        <div class="collapse bg-base-200">
            <input type="checkbox" bind:checked={migrateCollapseOpen} />
            <div class="collapse-title text-xl font-medium flex gap-4 items-center">
                <div class="w-8 h-8 transition-transform duration-150" class:rotate-90={migrateCollapseOpen}>
                        {@html ChevronRightIcon}
                </div>
                <p>Migrate from plotlyshare v1 (on deta.space)</p>
            </div>
            <div class="collapse-content flex flex-col items-center">
                <div class="outline outline-1 outline-secondary text-secondary text-sm font-semibold w-fit rounded p-1 mb-4">
                    Upload your <code>.zip</code> exported from space
                    <!-- <button class="btn btn-primary">Upload</button> -->
                </div>
                <input type="file" accept=".zip" bind:files={migrateFileChosen} 
                class="file-input file-input-bordered file-input-secondary file-input-lg w-full" />
                <div class="text-base p-2 m-4 rounded {migrateErrored? "bg-error text-error-content": "bg-success text-success-content"}"
                    class:hidden={!migrateOutput}
                >
                    {migrateOutput}
                </div>
                {#if migrateOutput && !migrateErrored}
                {#if $loggedIn}
                    <button class="btn btn-success">Upload</button>
                {:else}
                    <div class="p-2 m-4 rounded bg-error text-error-content">You must be logged in to upload your old plots.</div>
                {/if}
                    <a class="btn btn-success" href="" bind:this={migrateDownload}>Download converted data as .zip</a>
                {/if}
            </div>
        </div>        

    
    </div>
    <form method="dialog" class="modal-backdrop">
        <button class="cursor-auto">close</button>
    </form>
</dialog>

<style type="postcss">
    .clicked-success {
        @apply active:btn-success focus:btn-success;
    }
</style>