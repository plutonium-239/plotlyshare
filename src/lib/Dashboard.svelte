<script lang="ts">
  import BreadCrumbs from './dashboard/BreadCrumbs.svelte';

    import type { UserData } from '../../functions/api/utils';
    import { collections, collection, dashboardView, data, getDemoMetadata, loggedIn, savedCollections, savedData, updateDates, updatePlotsNotInCollections, rootCollections, plotsNotInCollections, type PlotMetadata, profile } from './data';
    import Grid from './dashboard/Grid.svelte';
    import Table from './dashboard/Table.svelte';
    import TableIcon from './icons/table.svg?raw';
    import FolderIcon from './icons/folder.svg?raw';
    import TreeListIcon from './icons/list-tree.svg?raw';
    import PlotIcon from './icons/icon-nobg.svg?raw'
    import GridIcon from './icons/list-grid.svg?raw';
    import RefreshIcon from './icons/refresh.svg?raw';
    import Folder from './dashboard/Folder.svelte';

    export let params: any;
    // because we need it computed before everything else as well as reactively
    let location: string[] = params?.wild?.split('/') ?? []
    $: location = params?.wild?.split('/') ?? []

    document.getElementById("header")!.classList.remove('scrolled');
    
    // const local_format = Intl.DateTimeFormat();
    let plotsFetching = false


    // ! Sharing modal====================
    let sharingModal: HTMLDialogElement;
    let plotInSharing: {id: string, plot: PlotMetadata};
    function sharingPlot(plotid: string) {
        plotInSharing = { plot: $data.get(plotid)!, id: plotid }
        sharingModal.showModal();
    }
    async function sharingPlotAPIrequest() {
        if (!plotInSharing) return
        await fetch(`/api/plot/${$profile.uid}/${plotInSharing.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({public: !plotInSharing.plot.public})
        })
        await fetcher()
    }
    // ! =================================
    // ! Delete modal====================
    async function deletePlot(plotid: string) {
        if (confirm('Are you sure?')) {
            let deleteRes = await fetch(`/api/plot/${$profile.uid}/${plotid}`, {method: 'DELETE'})
            console.log({deleteRes});
            await fetcher()
        }
    }
    // ! =================================

    // updateDates($data)
    // console.log({location});

    // ! INIT
    $collections = $savedCollections
    $data = $savedData

    async function fetcher() {
        if (plotsFetching) {console.log("early demise"); return}
        plotsFetching = true
        console.log("fetcher called");
        // let data: Map<string, PlotMetadata>
        if (!$loggedIn) {
            // console.log($data);
            // if ($data.size === 0) 
            let demodata = await getDemoMetadata()
            $savedData = demodata.plots
            $savedCollections = demodata.collections
            $rootCollections = demodata.rootCollections
            console.log("existing NOT LOGGED IN", $savedData.size, "plots");
        } else {
            console.log("existing LOGGED IN", $savedData.size, "plots");
            let res: UserData = await fetch('/api/plots').then(res => res.json())
            console.log('res')
            console.log(res);
            // if (res.plots && (Object.keys(res.plots).length !== $data.size)) {
                $savedData = new Map(Object.entries(res.plots))
                console.log('$savedData udpated with res.plots');
                // console.log($data);
            // } 
            // else if (Object.keys(res.plots).length === 0) {
            //     console.log("logged in but no plots")
            //     // if logged in user does not have any plots
            //     $data = new Map()
            // }
            // if (res.collections && (Object.keys(res.collections).length !== $collections.size)) {
                $savedCollections = new Map(Object.entries(res.collections))
                console.log({$savedCollections});
            // }
            // if (res.rootCollections && (Object.keys(res.rootCollections).length !== $rootCollections.length)) {
                $rootCollections = res.rootCollections
                console.log({$rootCollections});
            // }
        }
        locUpdater()
        console.log("Ending fetcher");
        console.log({$data, $collections, $collection, plotsNotInCollections});
        
        setTimeout(() => { plotsFetching = false }, 400)
    }
    loggedIn.subscribe(async () => {console.log("loggedin trigger"); fetcher();})

    $: if (location) {console.log("location trigger"); locUpdater()}

    function locUpdater() {
        if (location.length > 0) {
            // @ts-expect-error
            $collection = $savedCollections.get(location[location.length-1])!
            $collection!.id = location[location.length-1]
            $collections = new Map($collection!.subcollections?.map((collid) => [collid, $savedCollections.get(collid)!]))
            $data = new Map($collection!.members.map((plotid) => [plotid, $savedData.get(plotid)!]))
        } else {
            $collection = null
            $data = $savedData
            $collections = $savedCollections
        }
        updateDates($data)
        updatePlotsNotInCollections($data, $collections)
        $data = $data
        $collections = $collections
    }

</script>

<svelte:head>
    <!-- REVIEW: NOT NEEDED? -->
    <!-- <link rel="stylesheet" href="/dashonly.css"/> -->
</svelte:head>
<div class="md:px-24 xl:px-36 py-8 max-md:px-4 md:flex flex-col justify-center min-w-[100vw] w-fit">

    <div class="mb-2 w-full flex items-center">
        <span class="tooltip tooltip-bottom" data-tip="Refresh Plots">
            <button on:click={fetcher} 
            class="btn btn-square btn-accent btn-outline btn-circle h-10 w-10 min-h-8 p-2"
            >
                <span class="animate-spin anim-paused w-full h-full [animation-duration:0.4s]" class:anim-paused={!plotsFetching}>
                    {@html RefreshIcon}
                </span>
            </button>
        </span>
        <div class="w-24 max-md:w-0"></div>
        <span class="px-4 ml-auto mr-auto flex gap-4">
            {#if plotsFetching}
            Fetching latest plots...
            {:else}
            <div class="inline-flex gap-1">
                {$collections.size} <span class="h-6 w-6">{@html FolderIcon}</span>
            </div>
            <div class="inline-flex gap-1">
                {$data.size} <span class="h-6 w-6">{@html PlotIcon}</span>
            </div>
            {/if}
        </span>
        <div class="inline-flex">
            <div class="join w-fit">
                <span class="tooltip tooltip-bottom" data-tip="Folder View">
                    <button on:click={() => {$dashboardView = "folder"}} class:btn-secondary={$dashboardView == 'folder'}
                        class="btn btn-square h-10 w-10 min-h-8 p-2 join-item"
                    >
                        {@html FolderIcon}
                    </button>
                </span>
                <span class="tooltip tooltip-bottom" data-tip="Tree View">
                    <button on:click={() => {$dashboardView = "tree"}} class:btn-secondary={$dashboardView == 'tree'}
                        class="btn btn-square h-10 w-10 min-h-8 p-2 join-item"
                    >
                        {@html TreeListIcon}
                    </button>
                </span>
            </div>
            <div class="divider divider-horizontal mx-0"></div>
            <div class="join w-fit">
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
            </div>
        </div>

    </div>
    <div class="mb-4 px-4 flex items-center self-center w-full md:w-fit justify-center bg-base-200 rounded-xl">
        <BreadCrumbs {location} />
    </div>

    {#if $dashboardView == 'table'}
    <Table {sharingPlot} {deletePlot} />
    {:else if $dashboardView == "grid"}
    <Grid {sharingPlot} {deletePlot} />
    {:else if $dashboardView == "folder"}
    <Folder sharing={sharingPlot} {deletePlot} />
    {/if}
</div>

<dialog bind:this={sharingModal} id="sharing_modal" class="modal">
    {#if plotInSharing?.id}
        <div class="modal-box flex flex-col items-center gap-4">
            <h3 class="text-lg font-bold text-primary">{plotInSharing.plot.name}</h3>
            <p>is visible to</p>
            <h3 class="text-lg font-bold underline decoration-dotted text-secondary">
                {plotInSharing.plot.public ? "anyone with the link" : "you"}
            </h3>
            <button class="btn btn-primary w-1/2" on:click={sharingPlotAPIrequest}>
                Turn {plotInSharing.plot.public ? "off" : "on"} sharing
            </button>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    {/if}
</dialog>



<style type="text/postcss">
    :root {
        @apply [--header-padding-x:6em] lg:[--header-padding-x:9em];
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