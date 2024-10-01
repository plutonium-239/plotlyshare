<script lang="ts">
    import { data, dates, profile, type PlotMetadata } from "../data";
    import DeleteIcon from '../icons/delete.svg?raw'


</script>

<div class="grid md:grid-cols-2 xl:grid-cols-3 items-stretch">
    {#if $data.size > 0  && dates.size > 0}
    {#each $data.entries() as [key, item] (key) }
        <div class="card bg-base-200 m-4 aspect-video shadow-lg hover:bg-secondary/25 transition-colors duration-150">
            <!-- svelte-ignore a11y-missing-content -->
            <a class="absolute w-full h-full" href="#/plot/{$profile.uid}/{key}"></a>
            <div class="card-body">
                <span class="card-title z-[5]">{item.name}</span>
                
                <span class="col-hide-small">{ dates.get(key)?.long_time }</span>
                <span class="block md:hidden">{ dates.get(key)?.short_time }</span>
                
                <div class="mt-auto card-actions self-end">
                    <button type="button" class="z-[5] btn btn-outline btn-error btn-square btn-sm custom-btn" on:click={() => confirm('Are you sure?')}>
                        {@html DeleteIcon}
                    </button>
                </div>
            </div>
        </div>
    {/each}
    {/if}
</div>