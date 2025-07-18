<script lang="ts">
    import { dates, profile, type PlotMetadata } from "../data";
    import DeletePlot from "./common/DeletePlot.svelte";
    import SharePlot from "./common/SharePlot.svelte";
    
    export let key: string
    export let sharingPlot: (s: string) => void
    export let deletePlot: (s: string) => void
    export let item: PlotMetadata

</script>

<div class="card bg-base-200 aspect-video shadow-lg col-span-1">
    <a class="absolute w-full h-full hover:bg-secondary/15 transition-colors duration-150 rounded-xl" 
        href="#/plot/{$profile.uid}/{key}" title="Open Plot"> </a>
    
    <div class="card-body">
        <span class="card-title z-[5] text-primary">{item.name ?? "bruh moment"}</span>
        
        <time datetime={item.time_created} class="time-hide-lg">{ dates.get(key)?.long_time }</time>
        <time datetime={item.time_created} class="block text-base lg:hidden">{ dates.get(key)?.short_time }</time>
        
        <div class="mt-auto card-actions items-center justify-between">
            <SharePlot {key} visible={item.public} {sharingPlot} />
            <DeletePlot {key} {deletePlot} />
        </div>
    </div>
</div>
