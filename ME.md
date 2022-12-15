cd ../node-soap/;npm run build;cd ../wsdl-tsclient;rm -rf node_modules/soap; npm i ../node-soap --ignore-scripts;

npx ts-node test.ts > log2
npx ts-node dev2.ts > log


rm -rf node_modules/soap/
npm i valrnd/node-soap