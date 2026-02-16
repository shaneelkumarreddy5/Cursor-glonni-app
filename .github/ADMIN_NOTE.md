# Repository Administrator Note

## Setting Main as Default Branch

To complete the setup of `main` as the default branch for this repository on GitHub:

### Option 1: Using GitHub CLI (Recommended)

If you have the GitHub CLI (`gh`) installed and authenticated, you can use the provided script:

```bash
.github/set-default-branch.sh
```

Or run the command directly:

```bash
gh repo edit shaneelkumarreddy5/Cursor-glonni-app --default-branch main
```

This single command will update the default branch to `main`.

### Option 2: Using GitHub Web Interface

1. Navigate to the repository on GitHub: https://github.com/shaneelkumarreddy5/Cursor-glonni-app
2. Click on **Settings** (requires admin access)
3. In the left sidebar, click on **Branches**
4. Under **Default branch**, you'll see the current default branch
5. Click the switch/edit icon (⇄ or pencil icon) next to the default branch name
6. Select `main` from the dropdown menu
7. Click **Update** 
8. Confirm the change in the dialog that appears

### Why This Matters:

- When users clone the repository without specifying a branch, they'll get `main`
- Pull requests will default to targeting `main`
- GitHub will show `main` as the primary branch in the repository interface
- CI/CD workflows typically default to the repository's default branch

### Current Status:

The `main` branch exists and is ready to be set as the default. The repository currently shows `cursor/glonni-frontend-application-structure-af91` as the default branch on GitHub, which should be changed to `main`.

### For Local Development:

If you've already cloned the repository before this change, you can update your local default branch reference:

```bash
git remote set-head origin main
git checkout main
git pull origin main
```
