<script lang="ts">
    import { data, dates, profile } from '../data';
    import LinkIcon from '../icons/link.svg?raw'
    import DeletePlot from './common/DeletePlot.svelte';
    import SharePlot from './common/SharePlot.svelte';

    export let sharingPlot: (plotid: string) => void
    export let deletePlot: (plotid: string) => void
    
</script>

<table class="table table-zebra table-xs md:table-lg sortable">
    <thead class="sticky top-16">
        <tr class="bg-base-300 text-secondary md:text-lg">
            <th class="th-name">Name</th>
            <th class="no-sort text-center">Link</th>
            <th class="max-xl:hidden">ID</th>
            <th class="th-time">Time Created</th>
            <th class="text-center">Sharing</th>
            <th class="no-sort text-center">Delete</th>
        </tr>
    </thead>
    <tbody class="">
        <!-- {#await fetcher() then} -->
        {#if $data.size > 0 && dates.size > 0}
        {#each $data.entries() as [key, item] (key) }
            <tr>
                <td>
                    <div class="col-name-outer">
                        {item.name}
                        <!-- <form action="{{ url_for('update_name', key=item) }}" method="post">
                            <textarea contentEditable="plaintext-only" data-enable-grammarly="false" rows="1" name="name_holder" class="col-name form-control-plaintext" value="{{ meta[item].name }}">{{ meta[item].name }}</textarea>
                            <button type="submit" class="btn btn-success custom-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m10 13.6l5.9-5.9q.275-.275.7-.275t.7.275q.275.275.275.7t-.275.7l-6.6 6.6q-.3.3-.7.3t-.7-.3l-2.6-2.6q-.275-.275-.275-.7t.275-.7q.275-.275.7-.275t.7.275z"/></svg>
                            </button>
                        </form> -->
                    </div>
                </td>
                <td class="text-center"> 
                    <a class="btn btn-primary btn-square btn-sm custom-btn btn-pink" href="#/plot/{$profile.uid}/{key}" role="button">
                        {@html LinkIcon}
                    </a> 
                </td>
                <td class='max-xl:hidden'>
                    <span class="tooltip tooltip-accent" data-tip={key}>
                        <div class="max-w-32 overflow-hidden overflow-ellipsis">
                            { key }
                        </div>
                    </span>
                </td>
                <td class='date-formattable max-md:w-12'>
                    <span class="col-hide-small">{ dates.get(key)?.long_time }</span>
                    <span class="block md:hidden">{ dates.get(key)?.short_time }</span>
                </td>
                <td class="text-center">
                    <SharePlot {key} visible={item.public} {sharingPlot} />
                </td>
                <td class="text-center">
                    <DeletePlot {key} {deletePlot} />
                    <!-- <form action="{{ url_for('delete_plot', key=item, confirm='yes') }}" method="post"> -->
                        <!-- <button type="submit" class="btn btn-outline btn-error btn-square btn-sm custom-btn" on:click={() => deletePlot(key)}>
                            {@html DeleteIcon}
                        </button> -->
                    <!-- </form> -->
                </td>
            </tr>
        {/each}
        {/if}
        <!-- {/await} -->
    </tbody>
    </table>

<style type="text/postcss">
    :global(.table-xs :where(td)) {
        @apply py-4;
    }
    :global(td > span, td > div, th) {
        @apply text-wrap leading-6 text-base;
    }
    :global(td > .btn) {
        @apply max-md:w-12 max-md:h-12;
    }
    /* .custom-tooltip {
        @apply relative inline-block;
    }
    .custom-tooltip::before {
        @apply bg-accent text-accent-content absolute bottom-6 left-1/2 opacity-0 transition-opacity duration-200;
        transform: translateX(-50%);
        content: attr(data-tip);
    }
    .custom-tooltip:hover:before {
        @apply opacity-100;
    } */
</style>

