<script lang="ts">
    import type { Readable } from "svelte/store";

    export let decision: Readable<any>;
    export let value: any;
    export let icon: string | undefined = undefined;
    export let tooltip: string;
    export let classes: string = "";
</script>

<span class="tooltip tooltip-bottom {classes}" data-tip={tooltip}>
    <button
        on:click={() => { $decision = value; }}
        class:btn-secondary={$decision === value}
        class="btn btn-square h-10 w-10 min-h-8 p-2 join-item text-base font-medium content-center"
    >
        <slot name="icon">
            {#if icon}
                {@html icon}
            {:else}
                {tooltip}
            {/if}
        </slot>
    </button>
</span>
