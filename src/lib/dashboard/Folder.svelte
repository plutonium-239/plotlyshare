<script lang="ts">
    import type { CollectionData } from "../../../functions/api/utils";
    import { data, collections, collection, dates, plotsNotInCollections, type PlotMetadata } from "../data";
    import FolderCard from "./FolderCard.svelte";
    import AddIcon from '../icons/add.svg?raw';
    import NewCollection from "./NewCollection.svelte";

    let collectionModal: HTMLDialogElement

    function startMakeNewCollection() {
        collectionModal.showModal()
    }
    // $: console.log("collections changed", $collections.size);
    
</script>

<button class="btn btn-primary w-full text-lg items-center mb-4" on:click={startMakeNewCollection}>
    <span class="h-6 w-6">{@html AddIcon}</span>
    New collection
</button>
{#if $data.size > 0 && dates.size > 0}
<div class="grid sm:grid-cols-2 xl:grid-cols-3 items-stretch gap-4">
    {#each $collections as [key] (key)}
        <FolderCard {key} />
    {/each}
    <FolderCard key="uncategorized-{$collection?.id}" />
    
</div>
{/if}
<dialog class="modal" id="sharing_modal" bind:this={collectionModal}>
    <NewCollection currentCollections={$collections} currentPlots={$data} />
</dialog>