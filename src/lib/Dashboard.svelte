<script lang="ts">
  import Table from './dashboard/Table.svelte';

    import type { UserData } from '../../functions/api/utils';
    import { collections, dashboardView, data, dates, getDemoMetadata, loggedIn, type PlotMetadata } from './data';
    import { onMount } from 'svelte';
    import Grid from './dashboard/Grid.svelte';
    import GridIcon from './icons/grid.svg?raw';
    import ListIcon from './icons/list.svg?raw';

    document.getElementById("header")!.classList.remove('scrolled');
    
    const short_format = Intl.DateTimeFormat('default', {day: 'numeric', month:'short', hour:'numeric', minute:'numeric', hour12:false});
    // const local_format = Intl.DateTimeFormat();
    
    onMount(async () => {
        // let data: Map<string, PlotMetadata>
        if (!$loggedIn) {
            // console.log($data);
            if ($data.size === 0) $data = await getDemoMetadata()
            console.log($data);
            
        } else {
            let res: UserData = await fetch('/api/plots').then(res => res.json())
            console.log('res')
            console.log(res);
            if (res.plots && (Object.keys(res.plots).length !== $data.size)) {
                $data = new Map(Object.entries(res.plots))
                console.log('$data');
                console.log($data);
            } else {
                // if logged in user does not have any plots
                $data = new Map()
            //     $data = await getDemoMetadata()
            }
            if (res.collections && (Object.keys(res.plots).length !== $data.size)) {
                $collections = new Map(Object.entries(res.collections))
                console.log('$collections');
                console.log($collections);
            }
        }
        $data.forEach((value, key) => {
            const d = new Date(value.time_created);
            // key.time_created = local_format.format(d);
            dates.set(key, {long_time: d.toLocaleString(), short_time: short_format.format(d)});
        });
        console.log(dates);
        

    })

    // [...document.getElementsByClassName('date-formattable')].forEach((el) => {
    //     const d = new Date(el.children[0].textContent!!);
    //     // el.children[0].textContent = local_format.format(d);
    //     el.children[1].textContent = d.toLocaleString();
    //     el.children[2].textContent = short_format.format(d);
    //     // el.innerText = null;
    // });
</script>

<svelte:head>
    <link rel="stylesheet" href="/dashonly.css"/>
</svelte:head>
<div class="md:px-24 xl:px-36 py-8 max-md:px-4 md:flex flex-col justify-center min-w-[100vw] w-fit">

    <div class="join gap-1 w-fit p-2 place-self-end max-md:right-0">
        <span class="tooltip" data-tip="Grid View">
            <button on:click={() => {$dashboardView = "grid"}} class="btn btn-square h-10 w-10 min-h-8 p-2 join-item" class:btn-secondary={$dashboardView == 'grid'}>{@html GridIcon}</button>
        </span>
        <span class="tooltip" data-tip="List View">
            <button on:click={() => {$dashboardView = "list"}} class="btn btn-square h-10 w-10 min-h-8 p-2 join-item" class:btn-secondary={$dashboardView == 'list'}>{@html ListIcon}</button>
        </span>
    </div>
    {#if $dashboardView == 'list'}
    <Table />
    {:else if $dashboardView == "grid"}
    <Grid />
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
</style>