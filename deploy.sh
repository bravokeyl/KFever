#! /bin/bash
export AWS_PROFILE='ask';
timestamp=`date '+%Y-%m-%d-%H-%M-%S'`;
filename="kfever-$timestamp.zip";
echo $filename;
echo "Running script...";
rm kfever-*.zip
cd lambda/custom
zip -r ../../$filename . -x deploy.sh
cd ../..
echo "Uploading lambda function...";
aws lambda update-function-code --function-name kfever --zip-file fileb://$filename
echo "End script"
