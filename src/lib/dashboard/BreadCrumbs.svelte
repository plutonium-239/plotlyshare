<script lang="ts">
    import { savedCollections } from "../data";
    import HomeIcon from '../icons/home.svg?raw'

    export let location: string[];
</script>

<div class="breadcrumbs text-wrap">
    <ul>
    {#each ["Home", ...location] as l, index}
        <li>
            <a
                href="#/dash/{l !== 'Home' ? l : ""}"
                class="hover:bg-secondary/50 p-1 rounded-lg transition-colors duration-150 hover:text-secondary-content"
            >
                {#if l !== "Home"}
                    {$savedCollections.get(l)?.name}
                {:else}
                    <span class="h-5 w-5" title="root">{@html HomeIcon}</span>
                {/if}
            </a>
        </li>
    {/each}
    </ul>
</div>

<style type="text/postcss">
</style>
