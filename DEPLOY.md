# How to Deploy Your Project

This project consists of two parts:

1.  **Backend (Next.js)**: Located in the root directory.
2.  **Frontend (Vite/React)**: Located in the `/frontend` directory.

## Step 1: Push to GitHub

If you haven't already, push your code to a GitHub repository:

1.  Create a new repository on GitHub.
2.  Run the following commands in your terminal (at the project root):
    ```bash
    git remote add origin <YOUR_GITHUB_REPO_URL>
    git branch -M main
    git push -u origin main
    ```

## Step 2: Deploy Backend (Next.js)

1.  Go to [Vercel](https://vercel.com).
2.  Import your GitHub repository.
3.  Select the **Root** directory for the first project (call it `snapai-backend`).
4.  Add your Environment Variables from `.env`:
    - `GOOGLE_API_KEY`
    - `GOOGLE_PROJECT_ID`
5.  Deploy. You will get a URL like `https://snapai-backend.vercel.app`.

## Step 3: Deploy Frontend (Vite)

1.  In Vercel, create another project by importing the same repository.
2.  This time, set the **Root Directory** to `frontend`.
3.  Add the following Environment Variable:
    - `VITE_BACKEND_URL`: `https://snapai-backend.vercel.app` (The URL from Step 2)
4.  Deploy. You will get your live link!

---

**Note**: I have already fixed the build errors that were preventing the project from being deployed.

- Fixed Next.js build by excluding the `frontend` directory from TypeScript checks.
- Fixed Vite build by adding missing `vite-env.d.ts` for environment variable types.
