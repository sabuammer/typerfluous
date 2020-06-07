<script>
  import { fade } from "svelte/transition";
  import randomWords from "random-words";

  let numWords = 50;
  $: words = randomWords(numWords).join(" ");
</script>

<style>
  p {
    font-family: "Quicksand", sans-serif;
    font-size: 1.5em;
  }

  button {
    font-family: "Quicksand", sans-serif;
    font-size: 1.5em;
    border: none;
    background-color: unset;
  }

  button:hover {
    background-color: aliceblue;
  }
</style>

<div transition:fade>
  <button on:click={() => (numWords = 50)}>50</button>
  <button on:click={() => (numWords = 100)}>100</button>
  <button on:click={() => (numWords = 150)}>150</button>
  <p>{words}</p>
</div>
