<script lang="ts">
    import GridCard from "./GridCard.svelte";
    import { data, collections, collection, dates, plotsNotInCollections, type PlotMetadata, savedCollections, updatePlotsNotInCollections } from "../data";

    export let sharingPlot: (plotid: string) => void
    export let deletePlot: (plotid: string) => void

    function notNull(x: any) {
        return x!;
    }

    $: if ($collection) {
        updatePlotsNotInCollections($data, $collections)
        $plotsNotInCollections = $plotsNotInCollections
    }
    $: if ($plotsNotInCollections) {
        console.log("plotsNotInCollections");
        console.log($plotsNotInCollections);
    }

</script>

{#if $data.size > 0 && dates.size > 0}
{#each $collections as [collid] (collid)}
    {@const coll = notNull($savedCollections.get(collid))}
    <div class="collapse">
        <input type="checkbox" checked={true}/>
        <div class="collapse-title px-4">
            <div class="divider divider-accent text-accent w-full">{coll.name}</div>
        </div>
        <div class="collapse-content">
            <div class="grid md:grid-cols-2 xl:grid-cols-3 items-stretch gap-4">
            {#each coll.members as key (key)}
                {@const item = notNull($data.get(key))}
                <GridCard {item} {key} {sharingPlot} {deletePlot} />
            {/each}
            </div>
        </div>
    </div>
{/each}
<div class="collapse">
    <input type="checkbox" checked={true}/>
    <div class="collapse-title px-4">
        <div class="divider divider-accent text-accent w-full">Uncategorized</div>
    </div>
    <div class="collapse-content">
    {#if ($plotsNotInCollections.length > 0) && ($collection !== undefined)}
        <div class="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 items-stretch gap-4">
        {#each $plotsNotInCollections as key (key)}
            {@const item = notNull($data.get(key))}
            <GridCard {item} {key} {sharingPlot} {deletePlot} />
        {/each}
        </div>
    {:else}
        <div class="text-center w-full">Nothing to show, you're organized!</div>
    {/if}
    </div>
</div>
{/if}

