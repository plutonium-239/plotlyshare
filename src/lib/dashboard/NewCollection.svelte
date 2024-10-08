<script lang="ts">
    import SharedIcon from "../icons/shared.svg?raw";
    import EyeHiddenIcon from "../icons/eye-hidden.svg?raw";
    import type { CollectionData } from "../../../functions/api/utils";
    import type { PlotMetadata } from "../data";
    import FolderIcon from '../icons/folder.svg?raw'
    import PlotIcon from '../icons/icon-nobg.svg?raw'

    let makePublic = false;
    let name: string

    export let currentCollections: Map<string, CollectionData>;
    export let currentPlots: Map<string, PlotMetadata>;

    let collsToTake = Object.fromEntries(Object.keys(currentCollections).map((collID) => [collID, false]));
    let plotsToTake = Object.fromEntries(Object.keys(currentPlots).map((plotID) => [plotID, false]));

    async function makeNewCollection() {
        let collid = await fetch('https://uuid.rocks/short').then(res => res.text())

        
    }
</script>



<div class="modal-box flex flex-col items-center gap-4 max-w-4xl">
    <h3>Enter a name:</h3>
    <input
        type="text"
        placeholder="project plots"
        class="input input-bordered input-primary input-lg text-primary placeholder:italic w-full max-w-xs"
        bind:value={name}
    />

    <label class="flex w-52 cursor-pointer">
        <span class="label-text">Make collection public?</span>
        <div class="swap swap-flip">
            <input type="checkbox" bind:checked={makePublic} />
            <span class="swap-on bg-secondary text-secondary-content rounded-full w-10 h-10 p-1"
                >{@html SharedIcon}</span
            >
            <span class="swap-off text-secondary w-10 h-10 p-1">{@html EyeHiddenIcon}</span>
        </div>
    </label>

    <div>Choose which plots/collections from the current location to be included in the new collection:</div>
    <div class="flex w-full flex-wrap">
        <div class="divider divider-accent text-accent items-center text-xl w-full">
            <div class="w-6 h-6 aspect-square">{@html FolderIcon}</div>
            <span>Collections</span>
        </div>
        {#each currentCollections as [collID, coll] (collID)}
            <div class="form-control w-1/2 px-4">
                <label class="cursor-pointer label">
                    <span class="label-text">{coll.name}</span>
                    <input
                        type="checkbox"
                        bind:checked={collsToTake[collID]}
                        class="checkbox checkbox-primary"
                    />
                </label>
            </div>
        {/each}
        <div class="divider divider-accent text-accent items-center text-xl w-full">
            <div class="w-6 h-6 aspect-square">{@html PlotIcon}</div>
            <span>Plots</span>
        </div>
        {#each currentPlots as [plotID, plot] (plotID)}
            <div class="form-control w-1/2 px-4">
                <label class="cursor-pointer label">
                    <span class="label-text">{plot.name}</span>
                    <input
                        type="checkbox"
                        bind:checked={plotsToTake[plotID]}
                        class="checkbox checkbox-primary"
                    />
                </label>
            </div>
        {/each}
    </div>
</div>
<form method="dialog" class="modal-backdrop">
    <button>close</button>
</form>
