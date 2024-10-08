<script lang="ts">
    import ReaperIcon from './icons/reaper.svg?raw'
    export let params: any;
</script>

<div class="w-full flex flex-col justify-between items-center h-[calc(100%-6em)]">
    <h1 class="mt-8 text-3xl">
        The content you are looking for does not exist...
    </h1>
    <div class="text-5xl">404</div>
    <div class="h-3/4 opacity-50 clipper aspect-square">
        {@html ReaperIcon}
    </div>
</div>

<style type='postcss'>
    /* .clipper {
        animation: clipmove 4s cubic-bezier(0.46, 0.03, 0.52, 0.96) infinite alternate;
    }
    @media (prefers-reduced-motion) {
        .clipper {
            animation: none;
        }
    }
    @keyframes clipmove {
        0% {clip-path: polygon(0% 0%, 20% 0%, 0% 20%, 0% 0%);}
        50% {clip-path: polygon(80% 0%, 100% 0%, 20% 100%, 0% 100%);}
        100% {clip-path: polygon(100% 80%, 100% 100%, 100% 100%, 80% 100%);}
    } */
    .clipper {
        /* mask-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg' version='1.1'><polygon points='80,0 100,0 20,100 0,100' fill='white' /></svg>"); */
        mask-image: url('/maskinv.svg');
        animation: clipmove 4s cubic-bezier(0.46, 0.03, 0.52, 0.96) infinite alternate-reverse;
        mask-size: 100% 400%;
    }
    @keyframes clipmove {
        0% {mask-position: -50% 0;}
        100% {mask-position: 50% 100%;}
    }
</style>