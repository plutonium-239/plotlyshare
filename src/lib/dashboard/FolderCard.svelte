<script lang="ts">
    import { data, dates, plotsNotInCollections, profile, savedCollections, type PlotMetadata } from "../data";
    import DeleteIcon from '../icons/delete.svg?raw'
    import SharedIcon from '../icons/shared.svg?raw'
    import EyeHiddenIcon from '../icons/eye-hidden.svg?raw'
    import type { CollectionData } from "../../../functions/api/utils";
    import FolderIcon from '../icons/folder.svg?raw'
    import PlotIcon from '../icons/icon-nobg.svg?raw'
    
    export let key: string
    let item: CollectionData
    let uncategorizedCollection: CollectionData
    let link: string

    $: if (key) {
        // console.log("updating folder card for", key);
        uncategorizedCollection = {
            name: "Uncategorized",
            members: plotsNotInCollections,
            subcollections: [],
            public: false
        } as CollectionData
        item = key.startsWith('uncategorized-') ? uncategorizedCollection : $savedCollections.get(key)!
        // console.log({item})
        link = key.startsWith('uncategorized-') ? "" : key
    }
    
</script>


<div class="card folder bg-base-200 hover:bg-accent/15 hover:-translate-y-1 transition-all duration-150 aspect-video shadow-lg">
    <a class="absolute w-full h-full hover:bg-secondary/15 transition-colors duration-150 rounded-xl" 
        href="#/dash/{link}" title="Open Collection"> </a>
    
    <div class="card-body">
        <span class="card-title z-[5] text-primary">{item.name}</span>
        <div class="flex gap-2 mt-2 items-center">
            <span>{item.subcollections?.length ?? "0"}</span> 
            <span class="h-6 w-6 ">{@html FolderIcon}</span>
            <div class="divider divider-horizontal m-0"></div>
            <span>{item.members.length}</span> 
            <span class="h-5 w-5 ">{@html PlotIcon}</span>
        </div>

        <div class="mt-auto card-actions items-center">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <button title={item.public ? "Plot is public": "Plot is private" } type="button"
                class="z-[5] btn btn-circle btn-secondary p-1 w-8 h-8 min-h-0" class:sharingHideCls={!item.public}>
            {#if item.public}
                {@html SharedIcon}
            {:else}
                {@html EyeHiddenIcon}
            {/if}
            </button>
            <!-- <button title="Delete Plot?" type="button" class="z-[5] ml-auto btn btn-outline btn-error btn-square btn-sm custom-btn" on:click={() => confirm('Are you sure?')}>
                {@html DeleteIcon}
            </button> -->
        </div>
    </div>
</div>

<style type="postcss">
    .sharingHideCls {
        @apply btn-ghost text-secondary;
    }
    .folder {
        /* mask-image: url("data:image/svg+xml;utf-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' xml:space='preserve'><path fill='none' stroke='#000' stroke-width='2' stroke-miterlimit='10' d='M63 18v36H1V10h21l8 8z'/></svg>"); */
        /* mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHBhdGggZmlsbD0iIzAwMCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTYzIDE4djM2SDFWMTBoMjFsOCA4eiIvPjwvc3ZnPg=='); */
        /* mask-image: url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTUgMTUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTS41IDEyLjV2LTEwYTEgMSAwIDAgMSAxLTFoNGwyIDJoNmExIDEgMCAwIDEgMSAxdjhhMSAxIDAgMCAxLTEgMWgtMTJhMSAxIDAgMCAxLTEtMVoiIHN0cm9rZT0iIzAwMCIvPjwvc3ZnPg=='); */
        mask-image: url('../icons/folder16x9plain2.svg');
        mask-size: cover;
        mask-position: center;

    }
</style>