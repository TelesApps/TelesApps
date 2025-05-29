# telesApps
To export data from forestore follow the steps here:
Run gsutil rm -r gs://mydatachats.appspot.com/gcloud-export to first delete the gcloud export folder in cloud
https://stackoverflow.com/questions/57838764/how-to-import-data-from-cloud-firestore-to-the-local-emulator#:~:text=Go%20to%20my%20local%20Firebase,%3A%20emulators%3Aexport%20.%2Fmydirectory

1. Login to firebase and Gcloud:
    firebase login
    gcloud auth login

2. See a list of your projects and connect to one:
    firebase projects:list
    firebase use mydatachats

    gcloud projects list
    gcloud config set project mydatachats

3. Export your production data to gcloud bucket with chosen name:
    gcloud firestore export gs://mydatachats.appspot.com/gcloud-export
    (If can'e export because path is take first run)
        gsutil rm -r gs://mydatachats.appspot.com/gcloud-export

4. Now copy this folder to your local machine, I do that in functions folder directly:
    cd functions
    gsutil -m cp -r gs://mydatachats.appspot.com/gcloud-export .

5. Now we just want to import this folder.
    To start firebase emulator with data from storage run from \myDataCharts\functions:
        firebase emulators:start --import gcloud-export

    to export updates once you exit run from \myDataCharts\functions:
        firebase emulators:start --import gcloud-export --export-on-exit

To Test changes from your functions src run:
npm run build