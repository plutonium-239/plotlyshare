<script lang="ts">
    import GridCard from "./GridCard.svelte";
    import { data, collections, collection, dates, plotsNotInCollections, type PlotMetadata, savedCollections, updatePlotsNotInCollections } from "../data";
    let sharingModal: HTMLDialogElement;

    function notNull(x: any) {
        return x!;
    }

    let plotInSharing: PlotMetadata;
    function sharing(plotid: string) {
        sharingModal.showModal();
        plotInSharing = $data.get(plotid)!;
    }
    $: if ($collection) updatePlotsNotInCollections($data, $collections)

</script>

{#if $data.size > 0 && dates.size > 0}
{#each $collections as [collid] (collid)}
    {@const coll = notNull($savedCollections.get(collid))}
    <div class="collapse">
        <input type="checkbox" checked={true}/>
        <div class="collapse-title px-4">
            <div class="divider divider-accent text-accent col-span-full">{coll.name}</div>
        </div>
        <div class="collapse-content">
            <div class="grid md:grid-cols-2 xl:grid-cols-3 items-stretch gap-4">
            {#each coll.members as key (key)}
                {@const item = notNull($data.get(key))}
                <GridCard {item} {key} {sharing} />
            {/each}
            </div>
        </div>
    </div>
{/each}
<div class="collapse">
    <input type="checkbox" checked={true}/>
    <div class="collapse-title px-4">
        <div class="divider divider-accent text-accent col-span-full">Uncategorized</div>
    </div>
    <div class="collapse-content">
    {#if plotsNotInCollections.length > 0 && $collection}
        <div class="grid md:grid-cols-2 xl:grid-cols-3 items-stretch gap-4">
        {#each plotsNotInCollections as key (key)}
            {@const item = notNull($data.get(key))}
            <GridCard {item} {key} {sharing} />
        {/each}
        </div>
    {:else}
        <span class="text-center col-span-full">Nothing to show, you're organized!</span>
    {/if}
    </div>
</div>
{/if}

<dialog bind:this={sharingModal} id="grid_modal" class="modal">
    {#if plotInSharing}
        <div class="modal-box flex flex-col items-center gap-4">
            <h3 class="text-lg font-bold text-primary">{plotInSharing.name}</h3>
            <p>is visible to</p>
            <h3 class="text-lg font-bold underline decoration-dotted text-secondary">
                {plotInSharing.public ? "anyone with the link" : "you"}
            </h3>
            <button class="btn btn-primary w-1/2">Turn {plotInSharing.public ? "off" : "on"} sharing</button>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    {/if}
</dialog>
