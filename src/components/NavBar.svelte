<script>
    import {onMount, tick} from "svelte";
    import {fade} from "svelte/transition";
    import {goto} from "@sapper/app";
    import fire from "../config/fire";

    export let segment;

    let currentUser;

    fire.auth().onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            console.log(currentUser.photoURL);
        } else {
            console.log("user not logged in");
        }
    });

    async function handleLogout() {
        await fire.auth().signOut();
        currentUser = null;
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
        cursor: pointer;
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

    .user-profile > a {
        display: flex;
        align-items: center;
    }
</style>

<nav>
    <a class="title" href="/">typerfluous</a>
    {#if !currentUser}
        <a class="nav-item" href="login">login</a>
    {:else}
        <div class="nav-end">
            <div class="user-profile">
                <a href="profile">
                    <img src={currentUser.photoURL} alt="The profile picture">
                    <p class="user-greeting">{currentUser.email}</p>
                </a>
            </div>
            <button class="nav-item" on:click={handleLogout}>logout</button>
        </div>
    {/if}
</nav>
