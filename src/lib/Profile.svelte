<script lang="ts">
    import { forceDarkPlots, loggedIn, profile, type ProfileAPIResponse, selectedFont } from './data';
    import ProfileIcon from './icons/profile-default.svg?raw'
    import MoonIcon from './icons/moon.svg?raw'
    import SunIcon from './icons/sun.svg?raw'
    import CopyIcon from './icons/copy.svg?raw'
    import EyeHiddenIcon from './icons/eye-hidden.svg?raw'
    import EyeVisibleIcon from './icons/eye-visible.svg?raw'
    import Migration from './Migration.svelte';
    import { toast } from 'svoast';
    import SelectList from './SelectList.svelte';
    let profile_modal: HTMLDialogElement;

    // let profile: ProfileAPIResponse
    let cliTokenShown = false
    let tokenRegenerated = false
    
    
    async function logIn() {
        try {
            let data: ProfileAPIResponse | {error: string} 
                = await fetch('/api/auth/profile').then((res) => res.json())
            if ("error" in data) {
                throw new Error(data.error)
            } else {
                $profile = data as ProfileAPIResponse;
                $loggedIn = true;
                console.log("LOGGED IN");
                console.log($profile);
            }
        } catch (e) {
            $loggedIn = false;
            $profile = {uid: 'demo_plots'} as ProfileAPIResponse
            console.log("NOT LOGGED IN");
            console.error("reason:", e);
        }
    }
    async function logInToast() {
		return toast.promise(new Promise(async (resolve, reject) => {
            await logIn();
            if ($loggedIn) resolve(null);
            else reject();
        }), {
			loading: 'Logging in...',
			success: 'Logged in',
			error: 'Your session has expired, please log in again.'
		});
	}
    logInToast()

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

<button on:click={() => profile_modal.showModal()} class={$loggedIn ? "w-12" : "btn btn-circle btn-accent w-12"}>
    {#if $loggedIn}
        <div class="w-12 h-12 relative flex items-center justify-center aspect-square">
            <img class="z-10 absolute top-0 left-0 w-full blur-lg rounded-full" src={$profile.picture} aria-hidden="true" alt="blur backdrop" />
            <img class="z-20 rounded-full shadow-[black] shadow-lg" src={$profile.picture} alt="profile"/>
        </div>
    {:else}
        {@html ProfileIcon}
    {/if}
</button>
<dialog bind:this={profile_modal} class="modal" id="profile_modal">
    <div class="modal-box flex flex-col items-center">
        <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <!-- {#await logInToast then } -->
        {#if $loggedIn}
        <div class="w-48 h-48 m-5 relative flex items-center justify-center aspect-square">
            <img class="z-10 absolute top-0 left-0 w-full blur-lg rounded-full" src={$profile.picture} aria-hidden="true" alt="blur backdrop" />
            <img class="z-20 rounded-full shadow-[black] shadow-lg" src={$profile.picture} alt="profile"/>
        </div>
        <h3 class="text-lg font-bold">Hello {$profile.name}!</h3>
        <a class="btn btn-error btn-outline mt-4" href="/api/auth/logout" role="button" on:click={() => {$loggedIn = false}}>
            Log Out
        </a>

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
        <!-- {/await} -->
        
        <div class="divider text-accent">Preferences</div>

        <div class="form-control">
            <label class="cursor-pointer label gap-4 bg-base-200 hover:bg-base-300 rounded-xl px-4 transition-colors duration-150">
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

            <!-- <label class="label"> -->
            <div class="label px-4 bg-base-200 rounded-xl mt-4">
                <span class="text-base mr-4">Font</span>
                <!-- grid-auto-flow: column;
  grid-template-rows: 0fr 1fr;
  justify-items: center; -->
                <div class="grid gap-x-4 grid-flow-col [grid-template-rows:1fr_0fr] justify-items-center">
                    <!-- <div class="text-sm absolute -top-6 left-1/2 [transform:translateX(-50%)]">Monospace</div> -->
                    <div class="join bg-secondary/15 relative mt-1">
                        <SelectList decision={selectedFont} value="Cascadia Mono" tooltip="Cascadia Mono" classes="!p-1 [font-family:Cascadia_Mono]">
                            <span slot="icon" class="text-xl">Ab</span>
                        </SelectList>
                        <SelectList decision={selectedFont} value="Overpass Mono" tooltip="Overpass Mono" classes="!p-1 [font-family:Overpass_Mono]">
                            <span slot="icon" class="text-xl">Ab</span>
                        </SelectList>
                        <SelectList decision={selectedFont} value="Orbit" tooltip="Orbit" classes="!p-1 [font-family:Orbit] ">
                            <span slot="icon" class="text-xl">Ab</span>
                        </SelectList>
                    </div>
                    <div class="text-sm">Monospace</div>
                    <!-- <div class="text-sm absolute -top-6 left-1/2 [transform:translateX(-50%)]">Display</div> -->
                    <div class="join bg-secondary/15 relative mt-1">
                        <SelectList decision={selectedFont} value="Chakra Petch" tooltip="Chakra Petch" classes="!p-1 [font-family:Chakra_Petch]">
                            <span slot="icon" class="text-xl">Ab</span>
                        </SelectList>
                        <SelectList decision={selectedFont} value="Readex Pro" tooltip="Readex Pro" classes="!p-1 [font-family:Readex_Pro]">
                            <span slot="icon" class="text-xl">Ab</span>
                        </SelectList>
                    </div>
                    <div class="text-sm">Display</div>
                </div>
            </div>
            <!-- </label> -->
        </div>

        <div class="divider text-secondary">Migrate old plots</div>
        
        <!-- ! MIGRATION -->
        <Migration />

    
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