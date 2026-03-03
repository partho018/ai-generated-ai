# How to Deploy to Vercel

This project is now a unified **Next.js** application. Follow these steps to deploy it:

## Step 1: Push to GitHub

If you haven't already, push your code to your GitHub repository:

```bash
git add .
git commit -m "Prepare for Vercel"
git push
```

## Step 2: Deploy on Vercel

1. Go to [Vercel](https://vercel.com).
2. Click **New Project** and import your GitHub repository.
3. In the **Environment Variables** section, add the following:

| Name                     | Value                                                  |
| ------------------------ | ------------------------------------------------------ |
| `GOOGLE_API_KEY`         | _Your Google AI API Key_                               |
| `GOOGLE_PROJECT_ID`      | _Your Google Project ID_                               |
| `GOOGLE_SERVICE_ACCOUNT` | _The entire content of your service-account.json file_ |

4. Click **Deploy**.

## Step 3: Verify

Once deployed, Vercel will give you a live URL (e.g., `https://your-project.vercel.app`). Your app is now live!

---

**Note**: The code has been updated to automatically use the `GOOGLE_SERVICE_ACCOUNT` environment variable if it exists, ensuring it works perfectly on Vercel without needing the physical JSON file in the repository.
