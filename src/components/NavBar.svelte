<script>
  import { onMount, tick } from "svelte";
  import { fade } from "svelte/transition";
  import { goto } from "@sapper/app";
  import fire from "../config/fire";
  import { currentUser } from "../stores/currentUser";

  async function handleLogout() {
    $currentUser = null;
    await fire.auth().signOut();
  }
</script>

<style>
  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  a {
    text-decoration: none;
  }

  button {
    border: none;
    background: transparent;
    font-size: 1.3em;
    text-align: right;
    padding: 0;
    cursor: pointer;
    outline: none;
  }

  .title {
    font-size: 3em;
  }

  .user-greeting {
    font-size: 1.3em;
    margin: 0;
  }

  .nav-item {
    font-weight: bold;
    font-size: 1.3em;
    margin-left: auto;
  }

  img {
    height: 1.5em;
    width: 1.5em;
    border-radius: 50%;
    margin-right: 15px;
  }

  .user-profile {
    display: flex;
    align-items: center;
  }

  .nav-end {
    display: flex;
    flex-direction: column;
  }
</style>

<nav>
  <a class="title" href="/">typerfluous</a>
  {#if !$currentUser}
    <a class="nav-item" href="login">login</a>
  {:else}
    <div class="nav-end">
      <a class="user-profile" href={`profile/${$currentUser.username}`}>
        {#if $currentUser.photoURL}
          <img src={$currentUser.photoURL} alt="The profile picture" />
        {/if}
        <p class="user-greeting">{$currentUser.username}</p>
      </a>
      <button class="nav-item" on:click={handleLogout}>logout</button>
    </div>
  {/if}
</nav>
