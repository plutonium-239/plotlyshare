<script lang="ts">
  import BreadCrumbs from './dashboard/BreadCrumbs.svelte';

    import type { UserData } from '../../functions/api/utils';
    import { collections, collection, dashboardView, data, getDemoMetadata, loggedIn, savedCollections, savedData, updateDates, updatePlotsNotInCollections, rootCollections, plotsNotInCollections } from './data';
    import Grid from './dashboard/Grid.svelte';
    import Table from './dashboard/Table.svelte';
    import TableIcon from './icons/table.svg?raw';
    import FolderIcon from './icons/folder.svg?raw';
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
    // updateDates($data)
    // console.log({location});
    $: if (location) {console.log("location trigger"); fetcher()}

    const fetcher = async () => {
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
            if (res.plots && (Object.keys(res.plots).length !== $data.size)) {
                $savedData = new Map(Object.entries(res.plots))
                console.log('$savedData udpated with res.plots');
                // console.log($data);
            } 
            // else if (Object.keys(res.plots).length === 0) {
            //     console.log("logged in but no plots")
            //     // if logged in user does not have any plots
            //     $data = new Map()
            // }
            if (res.collections && (Object.keys(res.collections).length !== $collections.size)) {
                $savedCollections = new Map(Object.entries(res.collections))
                console.log({$savedCollections});
            }
            if (res.rootCollections && (Object.keys(res.rootCollections).length !== $rootCollections.length)) {
                $rootCollections = res.rootCollections
                console.log({$rootCollections});
            }
        }
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
        console.log("Ending fetcher");
        console.log({$data, $collections, $collection, plotsNotInCollections});
        
        setTimeout(() => { plotsFetching = false }, 400)
    }
    loggedIn.subscribe(async () => {console.log("loggedin trigger"); fetcher();})

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
            <span class="tooltip tooltip-bottom" data-tip="Folder View">
                <button on:click={() => {$dashboardView = "folder"}} class:btn-secondary={$dashboardView == 'folder'}
                    class="btn btn-square h-10 w-10 min-h-8 p-2" 
                >
                    {@html FolderIcon}
                </button>
            </span>
            <div class="divider divider-horizontal mx-0"></div>
            <div class="join w-fit max-md:right-0">
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
    <Table />
    {:else if $dashboardView == "grid"}
    <Grid />
    {:else if $dashboardView == "folder"}
    <Folder />
    {/if}

</div>

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