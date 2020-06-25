<script>
    import NavBar from "../components/NavBar.svelte";
    import {fade} from "svelte/transition";
    import {onMount} from "svelte";

    let init = false;
    onMount(() => (init = true));
</script>

<style>
    main {
        max-width: 70%;
        margin: 0 auto;
    }
</style>

{#if init}
    <main in:fade={{ delay: 250 }}>
        <NavBar/>
        <slot/>
    </main>
{/if}
