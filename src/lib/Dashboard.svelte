<script lang="ts">
    import type { UserData } from '../../functions/api/utils';
    import { collections, dashboardView, data, getDemoMetadata, loggedIn, updateDates, updatePlotsNotInCollections } from './data';
    import Grid from './dashboard/Grid.svelte';
    import Table from './dashboard/Table.svelte';
    import TableIcon from './icons/table.svg?raw';
    import FolderIcon from './icons/folder.svg?raw';
    import GridIcon from './icons/list-grid.svg?raw';
    import RefreshIcon from './icons/refresh.svg?raw';
    import Folder from './dashboard/Folder.svelte';
    
    document.getElementById("header")!.classList.remove('scrolled');
    
    // const local_format = Intl.DateTimeFormat();
    let plotsFetching = true
    updateDates($data)
    
    const fetcher = async () => {
        plotsFetching = true
        console.log("fetcher called");
        // let data: Map<string, PlotMetadata>
        if (!$loggedIn) {
            // console.log($data);
            // if ($data.size === 0) 
            let demodata = await getDemoMetadata()
            $data = demodata.plots
            $collections = demodata.collections
            console.log("existing NOT LOGGED IN", $data.size, "plots");
        } else {
            console.log("existing LOGGED IN", $data.size, "plots");
            let res: UserData = await fetch('/api/plots').then(res => res.json())
            console.log('res')
            console.log(res);
            if (res.plots && (Object.keys(res.plots).length !== $data.size)) {
                $data = new Map(Object.entries(res.plots))
                console.log('$data udpated with res.plots');
                // console.log($data);
            } 
            // else if (Object.keys(res.plots).length === 0) {
            //     console.log("logged in but no plots")
            //     // if logged in user does not have any plots
            //     $data = new Map()
            // }
            if (res.collections && (Object.keys(res.collections).length !== $collections.size)) {
                $collections = new Map(Object.entries(res.collections))
                console.log('$collections');
                console.log($collections);
            }
        }
        updateDates($data)
        updatePlotsNotInCollections($data, $collections)
        $data = $data
        setTimeout(() => { plotsFetching = false }, 400)
    }
    loggedIn.subscribe(async () => {await fetcher()})

    // setInterval(() => {
    //     $loggedIn = false
    //     console.log("zamn zawg");        
    //     $data.set("zamn", {name: "zamn", timestamp: 0, time_created:"2023-12-22T22:07:55+0530", linked_file: "/icon-nobg.svg", public: true})
    //     $data = $data
    // }, 5000)

</script>

<svelte:head>
    <!-- REVIEW: NOT NEEDED? -->
    <!-- <link rel="stylesheet" href="/dashonly.css"/> -->
</svelte:head>
<div class="md:px-24 xl:px-36 py-8 max-md:px-4 md:flex flex-col justify-center min-w-[100vw] w-fit">

    <!-- TODO: REMOVE ALERT WHEN COLLECTION SUPPORT IS ADDED -->
    <div role="alert" class="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 shrink-0 stroke-current">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="flex flex-col items-center mr-auto ml-auto">
            <span>Collections are WIP and not live yet</span>
            <span class="text-xs">While you can use the UI, the backend has been disabled</span>
        </div>
    </div>

    <div class="mb-4 w-full flex items-center">
        <span class="tooltip tooltip-bottom" data-tip="Refresh Plots">
            <button on:click={fetcher} 
            class="btn btn-square btn-accent btn-outline btn-circle h-10 w-10 min-h-8 p-2"
            >
                <span class="animate-spin anim-paused w-full h-full [animation-duration:0.4s]" class:anim-paused={!plotsFetching}>
                    {@html RefreshIcon}
                </span>
            </button>
        </span>
        <div class="w-10 mr-auto"></div>
        <span>
            {#if plotsFetching}
            Fetching latest plots...
            {:else}
            {$data.size} plots
            {/if}
        </span>
        <div class="join gap-1 w-fit p-2 max-md:right-0 ml-auto">
            <span class="tooltip tooltip-bottom" data-tip="Table View">
                <button on:click={() => {$dashboardView = "table"}} class:btn-secondary={$dashboardView == 'table'}
                    class="btn btn-square h-10 w-10 min-h-8 p-2 join-item" 
                >
                    {@html TableIcon}
                </button>
            </span>
            <span class="tooltip tooltip-bottom" data-tip="Grid View">
                <button on:click={() => {$dashboardView = "grid"}} class:btn-secondary={$dashboardView == 'grid'}
                    class="btn btn-square h-10 w-10 min-h-8 p-2 join-item" 
                >
                    {@html GridIcon}
                </button>
            </span>
            <span class="tooltip tooltip-bottom" data-tip="Folder View">
                <button on:click={() => {$dashboardView = "folder"}} class:btn-secondary={$dashboardView == 'folder'}
                    class="btn btn-square h-10 w-10 min-h-8 p-2 join-item" 
                >
                    {@html FolderIcon}
                </button>
            </span>
        </div>
    </div>

    {#if $dashboardView == 'table'}
    <Table />
    {:else if $dashboardView == "grid"}
    <Grid />
    {:else if $dashboardView == "folder"}
    <Folder />
    {/if}

</div>

<style type="text/postcss">
    :root {
        @apply [--header-padding-x:6em] lg:[--header-padding-x:12em];
    }
    :global(.custom-btn) {
        @apply box-border md:box-content p-1;
        & svg {
            @apply max-md:w-full max-md:h-full;
        }
    }
    :global(.btn-pink) {
        @apply hover:bg-[#f07] hover:border-[#f07];
    }
    .anim-paused {
        animation-play-state: paused;
    }
</style>