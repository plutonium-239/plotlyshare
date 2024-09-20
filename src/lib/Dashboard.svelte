<script lang="ts">
    import { get } from 'svelte/store';
    import { data, meta } from './data';

    
    const short_format = Intl.DateTimeFormat('default', {day: 'numeric', month:'short', hour:'numeric', minute:'numeric', hour12:false});
    // const local_format = Intl.DateTimeFormat();
    let dates : Map<string, {long_time: string, short_time: string}> = new Map()
    meta.forEach((value, key) => {
        const d = new Date(value.time_created);
        // key.time_created = local_format.format(d);
        dates.set(key, {long_time: d.toLocaleString(), short_time: short_format.format(d)});
    });

    // [...document.getElementsByClassName('date-formattable')].forEach((el) => {
    //     const d = new Date(el.children[0].textContent!!);
    //     // el.children[0].textContent = local_format.format(d);
    //     el.children[1].textContent = d.toLocaleString();
    //     el.children[2].textContent = short_format.format(d);
    //     // el.innerText = null;
    // });
</script>

<svelte:head>
    <link rel="stylesheet" href="/public/dashonly.css"/>
</svelte:head>
<div class="md:px-24 xl:px-36 py-8 max-md:px-4 md:flex justify-center min-w-[100vw] w-fit">
<table class="table table-zebra table-xs md:table-lg sortable">
    <thead class="sticky top-16">
        <tr class="bg-base-300 text-secondary md:text-lg">
            <th class="th-name">Name</th>
            <th class="no-sort text-center">Link</th>
            <th class="max-lg:hidden">ID</th>
            <th class="th-time">Time Created</th>
            <th class="no-sort text-center">Delete</th>
        </tr>
    </thead>
    <tbody class="">
        {#each data as item}
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
                    <a class="btn btn-primary btn-square btn-sm custom-btn btn-pink" href={"#/plot/" + item.key} role="button" target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7v2H5v14h14v-7h2v7q0 .825-.587 1.413T19 21zm4.7-5.3l-1.4-1.4L17.6 5H14V3h7v7h-2V6.4z"/></svg>
                    </a> 
                </td>
                <td class='max-lg:hidden'>{ item.key }</td>
                <td class='date-formattable max-md:w-12'>
                    <span class="col-hide-small">{ dates.get(item.key)?.long_time }</span>
                    <span class="block md:hidden">{ dates.get(item.key)?.short_time }</span>
                </td>
                <td class="text-center">
                    <!-- <form action="{{ url_for('delete_plot', key=item, confirm='yes') }}" method="post"> -->
                        <button type="submit" class="btn btn-outline btn-error btn-square btn-sm custom-btn" on:click={() => confirm('Are you sure?')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6 22v-4.25q-.975-.425-1.713-1.137T3.037 15q-.512-.9-.775-1.925T2 11q0-3.95 2.8-6.475T12 2q4.4 0 7.2 2.525T22 11q0 1.05-.263 2.075T20.963 15q-.513.9-1.25 1.613T18 17.75V22H6Zm2-2h1v2h2v-2h2v2h2v-2h1v-3.55q.95-.225 1.688-.75t1.25-1.25q.512-.725.787-1.6T20 11q0-3.125-2.212-5.063T12 4Q8.425 4 6.212 5.938T4 11q0 .975.275 1.85t.788 1.6q.512.725 1.262 1.25T8 16.45V20Zm2.5-4.25h3l-1.5-3l-1.5 3ZM8.5 13q.825 0 1.413-.588T10.5 11q0-.825-.588-1.413T8.5 9q-.825 0-1.413.588T6.5 11q0 .825.588 1.413T8.5 13Zm7 0q.825 0 1.413-.588T17.5 11q0-.825-.588-1.413T15.5 9q-.825 0-1.413.588T13.5 11q0 .825.588 1.413T15.5 13ZM8 20v-3.55q-.925-.225-1.675-.75t-1.263-1.25q-.512-.725-.787-1.6T4 11q0-3.125 2.212-5.062T12 4q3.575 0 5.788 1.938T20 11q0 .975-.275 1.85t-.788 1.6q-.512.725-1.25 1.25T16 16.45V20H8Z"/></svg>
                        </button>
                    <!-- </form> -->
                </td>
            </tr>
        {/each}
    </tbody>
</table>
</div>

<style type="text/postcss">
    :root {
        @apply [--header-padding-x:6em] lg:[--header-padding-x:12em];
    }
    .custom-btn {
        @apply box-border md:box-content p-1;
        & svg {
            @apply max-md:w-full max-md:h-full;
        }
    }
    .btn-pink {
        @apply hover:bg-[#f07] hover:border-[#f07];
    }
    :global(.table-xs :where(td)) {
        @apply py-4;
    }
    :global(td > span, td > div, th) {
        @apply text-wrap leading-6 text-base;
    }
    :global(td > .btn) {
        @apply max-md:w-12 max-md:h-12;
    }
</style>