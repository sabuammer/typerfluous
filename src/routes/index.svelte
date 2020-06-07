<script>
  import { onMount, tick } from "svelte";
  import { onInterval } from "../utils.js";
  import Words from "../components/Words.svelte";

  let init = false;
  let done = false;
  onMount(() => (init = true));

  function typewriter(node, { speed = 75 }) {
    const text = node.textContent;
    const duration = text.length * speed;

    return {
      duration,
      tick: t => {
        const i = ~~(text.length * t);
        node.textContent = text.slice(0, i);
      }
    };
  }

  function handleIntroend() {
    done = true;
  }
</script>

<style>
  h1 {
    text-align: center;
    margin: 0 auto;
    font-family: "Quicksand", sans-serif;
    font-size: 4em;
  }
</style>

<svelte:head>
  <title>typerfluous</title>
  <link
    href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300&display=swap"
    rel="stylesheet" />
</svelte:head>

{#if init}
  <h1 in:typewriter on:introend={handleIntroend}>typerfluous</h1>
{/if}

{#if done}
    <Words />
{/if}
