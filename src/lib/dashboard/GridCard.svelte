<script lang="ts">
    import { data, dates, plotsNotInCollections, profile, type PlotMetadata } from "../data";
    import DeleteIcon from '../icons/delete.svg?raw'
    import SharedIcon from '../icons/shared.svg?raw'
    import EyeHiddenIcon from '../icons/eye-hidden.svg?raw'
    
    export let item: PlotMetadata
    export let key: string
    export let sharing: (s: string) => void

    function openSharingWithPlot() {
        console.log("open sharing with", item.name);
        
        return sharing(key)
    }
</script>

<div class="card bg-base-200 aspect-video shadow-lg col-span-1">
    <a class="absolute w-full h-full hover:bg-secondary/15 transition-colors duration-150 rounded-xl" 
        href="#/plot/{$profile.uid}/{key}" title="Open Plot"> </a>
    
    <div class="card-body">
        <span class="card-title z-[5] text-primary">{item.name}</span>
        
        <span class="col-hide-small">{ dates.get(key)?.long_time }</span>
        <span class="block md:hidden">{ dates.get(key)?.short_time }</span>
        
        <div class="mt-auto card-actions items-center">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <button title={item.public ? "Plot is public": "Plot is private" } type="button" on:click={openSharingWithPlot}
                class="z-[5] btn btn-circle btn-secondary p-1 w-8 h-8 min-h-0" class:sharingHideCls={!item.public}>
            {#if item.public}
                {@html SharedIcon}
            {:else}
                {@html EyeHiddenIcon}
            {/if}
            </button>
            <button title="Delete Plot?" type="button" class="z-[5] ml-auto btn btn-outline btn-error btn-square btn-sm custom-btn" on:click={() => confirm('Are you sure?')}>
                {@html DeleteIcon}
            </button>
        </div>
    </div>
</div>

<style type="postcss">
    .sharingHideCls {
        @apply btn-ghost text-secondary;
    }
</style>