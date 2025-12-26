# Guide d'Installation - Rahma

## Étape 1 : Installer Node.js

Node.js n'est pas installé sur votre système. Vous devez l'installer pour pouvoir utiliser cette application.

### Option 1 : Installation via le site officiel (Recommandé)

1. **Téléchargez Node.js** :
   - Allez sur https://nodejs.org/
   - Téléchargez la version LTS (Long Term Support) - recommandée pour la plupart des utilisateurs
   - Choisissez le fichier Windows Installer (.msi) pour votre système (64-bit ou 32-bit)

2. **Installez Node.js** :
   - Double-cliquez sur le fichier téléchargé
   - Suivez l'assistant d'installation
   - **Important** : Cochez l'option "Add to PATH" si elle est proposée
   - Cliquez sur "Install" et attendez la fin de l'installation

3. **Redémarrez votre terminal** :
   - Fermez complètement PowerShell/CMD
   - Rouvrez-le pour que les changements de PATH prennent effet

4. **Vérifiez l'installation** :
   ```powershell
   node --version
   npm --version
   ```
   Vous devriez voir les numéros de version s'afficher.

### Option 2 : Installation via Chocolatey (si vous avez Chocolatey)

Si vous avez Chocolatey installé, vous pouvez utiliser :
```powershell
choco install nodejs-lts
```

### Option 3 : Installation via Winget (Windows 10/11)

```powershell
winget install OpenJS.NodeJS.LTS
```

## Étape 2 : Installer les dépendances du projet

Une fois Node.js installé :

1. **Ouvrez PowerShell dans le dossier du projet** :
   ```powershell
   cd C:\Users\prota\islamic-app
   ```

2. **Installez les dépendances** :
   ```powershell
   npm install
   ```

   Cette commande va télécharger toutes les bibliothèques nécessaires (React, React Router, Adhan, etc.)

## Étape 3 : Lancer l'application

Une fois l'installation terminée :

```powershell
npm run dev
```

L'application va démarrer et vous verrez une URL (généralement `http://localhost:5173`).
Ouvrez cette URL dans votre navigateur pour voir l'application.

## Dépannage

### Si npm n'est toujours pas reconnu après l'installation :

1. Vérifiez que Node.js est bien installé :
   - Allez dans "Paramètres" > "Applications" et cherchez "Node.js"
   
2. Redémarrez votre ordinateur (parfois nécessaire pour que PATH soit mis à jour)

3. Vérifiez manuellement le PATH :
   - Appuyez sur `Win + R`, tapez `sysdm.cpl` et appuyez sur Entrée
   - Allez dans l'onglet "Avancé" > "Variables d'environnement"
   - Vérifiez que `C:\Program Files\nodejs\` est dans la variable PATH

### Si vous rencontrez des erreurs lors de `npm install` :

- Assurez-vous d'avoir une connexion Internet stable
- Essayez de supprimer le dossier `node_modules` (s'il existe) et réessayez
- Sur certains systèmes, vous pourriez avoir besoin d'exécuter PowerShell en tant qu'administrateur

## Besoin d'aide ?

Si vous rencontrez des problèmes, vérifiez :
- La version de Node.js installée (doit être 16 ou supérieure)
- Que vous êtes dans le bon dossier (`C:\Users\prota\islamic-app`)
- Que votre connexion Internet fonctionne

