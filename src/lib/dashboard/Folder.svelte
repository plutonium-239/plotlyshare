<script lang="ts">
    import type { CollectionData } from "../../../functions/api/utils";
    import { data, collections, collection, dates, plotsNotInCollections, type PlotMetadata, profile } from "../data";
    import FolderCard from "./FolderCard.svelte";
    import AddIcon from '../icons/add.svg?raw';
    import NewCollection from "./NewCollection.svelte";
    let sharingModal: HTMLDialogElement;
    let collInSharing: CollectionData & {id: string};
    function sharing(collid: string) {
        sharingModal.showModal();
        // @ts-expect-error
        collInSharing = $collections.get(collid)!;
        collInSharing.id = collid
    }

    let collectionModal: HTMLDialogElement

    function startMakeNewCollection() {
        collectionModal.showModal()
    }
    // $: console.log("collections changed", $collections.size);
    
    function copyLinkToClipboard() {
        navigator.clipboard.writeText(`${location.origin}/#/collection/${$profile.uid}/${collInSharing.id}`)
    }
</script>

<button class="btn btn-primary w-full text-lg items-center mb-4" on:click={startMakeNewCollection}>
    <span class="h-6 w-6">{@html AddIcon}</span>
    New collection
</button>
{#if $data.size > 0 && dates.size > 0}
<div class="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 items-stretch gap-4">
    {#each $collections as [key] (key)}
        <FolderCard {key} {sharing} />
    {/each}
    <FolderCard key="uncategorized-{$collection?.id}" {sharing} />
    
</div>
{/if}
<dialog class="modal" id="newcollection_modal" bind:this={collectionModal}>
    <NewCollection currentCollections={$collections} currentPlots={$data} />
</dialog>

<dialog bind:this={sharingModal} id="sharing_modal" class="modal">
    {#if collInSharing}
        <div class="modal-box flex flex-col items-center gap-4">
            <h3 class="text-lg font-bold text-primary">{collInSharing.name}</h3>
            <p>is visible to</p>
            <h3 class="text-lg font-bold underline decoration-dotted text-secondary">
                {collInSharing.public ? "anyone with the link" : "you"}
            </h3>
            <div class="join w-full gap-1">
                <button class="join-item btn btn-accent w-1/2">Turn {collInSharing.public ? "off" : "on"} sharing</button>
                <button class="join-item btn btn-accent w-1/2" on:click={copyLinkToClipboard}>Copy Link</button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    {/if}
</dialog>