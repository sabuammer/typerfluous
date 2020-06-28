<script>
  import { NotificationDisplay, notifier } from "@beyonk/svelte-notifications";
  import { createForm } from "svelte-forms-lib";
  import * as yup from "yup";
  import { fade } from "svelte/transition";
  import fire from "../config/fire";
  import User from "../models/user";
  import { goto } from "@sapper/app";
  import { currentUser } from "../stores/currentUser";

  const { form, errors, state, handleChange, handleSubmit } = createForm({
    initialValues: {
      email: "",
      password: ""
    },
    validationSchema: yup.object().shape({
      email: yup
        .string()
        .email("Invalid email address")
        .required("Email address is required"),
      password: yup.string().required("Password is required")
    }),
    onSubmit: values => {
      const { email, password } = values;

      fire
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(async data => {
          const { user } = data;

          let username = await fire
            .database()
            .ref(`users/${user.uid}/username`)
            .once("value", snapshot => {
              return snapshot;
            });

          $currentUser = new User(
            username.val(),
            user.email,
            user.uid,
            user.photoURL
          );

          await goto("/");
        })
        .catch(err => {
          notifier.danger(err, 2500);
        });
    }
  });
</script>

<style>
  form {
    display: flex;
    flex-direction: column;
    padding: 35px;
    margin-top: 15px;
    border-radius: 7px;
    min-width: 40%;
    background: #c8d2e0;
  }

  input {
    border: none transparent;
    outline: none;
    background: #9aa2ad;
    border-radius: 3px;
    padding: 10px;
    line-height: 1.25em;
    margin-top: 5px;
    border-bottom: 3px solid transparent;
  }

  input:focus {
    border-bottom: 3px solid #333;
  }

  h1 {
    margin: 0 0 25px;
    font-size: 1.75em;
    font-weight: bold;
  }

  label {
    font-size: 1.25em;
  }

  button {
    background: #5a5d63;
    color: white;
    margin-top: 25px;
    font-size: 1.25em;
    border-radius: 3px;
    padding: 5px;
    border: none;
  }

  .error {
    color: red;
    height: 1em;
    margin-bottom: 5px;
  }

  .input-field {
    display: flex;
    flex-direction: column;
  }
</style>

<NotificationDisplay />
<form on:submit={handleSubmit}>
  <h1>Login</h1>
  <div class="input-field">
    <label for="email">Email</label>
    <input
      type="text"
      name="email"
      id="email"
      on:change={handleChange}
      on:blur={handleChange}
      bind:value={$form.email} />
    <span class="error">{$errors.email}</span>
  </div>
  <div class="input-field">
    <label for="password">Password</label>
    <input
      type="password"
      name="password"
      id="password"
      on:change={handleChange}
      on:blur={handleChange}
      bind:value={$form.password} />
    <span class="error">{$errors.password}</span>
  </div>
  <button type="submit">Log In</button>
</form>
