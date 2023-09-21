import fs from "fs";
import puppeteer from "puppeteer";
import { headless } from "./config.js";
import {  getURL } from "./utils.js";


const start = async () => {

  console.log("Started... logging ....");
  
  const getValue = async (page,selector) =>  {
    let ele = await page.$(selector);
    //console.log(selector,':',ele)
    let eleVal = await page.evaluate(
      (element) => element?.textContent?.replace("\n", "").trim() || "NA",
      ele
    );
    //console.log(selector,':',eleVal)
    return eleVal;
  }
  const getListByXPath = async (page,basePath,additionalPath) =>  {
    const containers = await page.$x(
      basePath
    );
    //console.log(containers);
    let valList=[];
    for (let k = 1; k <= containers.length; k++) {
      let [medsubEle] = await page.$x(
        `${basePath}[${k}]${additionalPath}`
      );
      //console.log(medsubEle);
      let val = await page.evaluate(
        (element) => element?.href?.replace("\n", "").trim() || "NA",
        medsubEle
      );
      //console.log(val);
      valList.push(val);
    }
    return valList;
  }

  const writeUpdatedData = async (fileName) => {
    const startTime=Number(new Date())
    const medData = JSON.parse(fs.readFileSync(`data/diseases/${fileName}`, { encoding: 'utf8' }));
    let updatedData = [];
    for (let i=0;i<medData.length;i++){
      const loopStartTime = Number(new Date());
      const browser = await puppeteer.launch({
        headless,
      });
      const context = browser.defaultBrowserContext();
      const row =medData[i];
      const web_url= getURL(row.slug)
      console.log(web_url)
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(0);
      await context.overridePermissions(web_url, ['geolocation']);
      await page.goto(web_url);
      // Set screen size
      await page.setViewport({ width: 1366, height: 700 });

      await new Promise((_func) => setTimeout(_func, 3000));
      
      
      try {
        
        let saltInfo = await getValue(page,'.saltInfo > a');
        let storage = await getValue(page,'.DrugHeader__meta-value___vqYM0');
        let productIntro = await getValue(page,'.DrugOverview__content___22ZBX');
        let uses = await getValue(page,'.DrugOverview__list___1HjxR');
        let benefits = await getValue(page,'.ShowMoreArray__tile___2mFZk');
        let sideEffects = await getValue(page,'.DrugOverview__list-container___2eAr6');
        let howtoconsume = await getValue(page,'.DrugOverview__container___CqA8x > div');
        //let missedTakingMedicine = await getValue(page,'.DrugOverview__container___CqA8x > div.DrugOverview__content___22ZBX');
        
        let substitute =await getListByXPath(page,`//*[@id="substitutes"]/div[2]/div/div[2]/div[2]/div[1]/div`,`/div[1]/a`);
        
        row['saltinfo']=saltInfo;
        row['storage']=storage;
        row['productIntro']=productIntro;
        row['uses']=uses;
        row['benefits']=benefits;
        row['sideEffects']=sideEffects;
        row['howtoconsume']=howtoconsume;
        //row['missedTakingMedicine']=missedTakingMedicine;
        row['substitute']=substitute;
        //let safetyAdvice =await getSafetyAdvice(page);
        //row['safetyAdvice']=safetyAdvice;
        //console.log("row",row);
        updatedData.push(row);
      
      } catch (error) {
        console.log("Error",error)
        //console.log('updateddata',updatedData);
        const filePath = `data/details/${fileName}`
        fs.writeFile(filePath, JSON.stringify(updatedData), err => {
            if (err) {
            console.error(err);
            }
            // file written successfully
        });
        const endTime=Number(new Date());
        console.log("In Error > Time take for ",fileName,(endTime-startTime)/1000,'Seconds')
      }
      await browser.close();
      const loopEndTime = Number(new Date());
      console.log("Time take for Loop ",i,fileName,(loopEndTime-loopStartTime)/1000,'Seconds')
      
    }
    //console.log('updateddata',updatedData);
    const filePath = `data/details/${fileName}`
    fs.writeFile(filePath, JSON.stringify(updatedData), err => {
        if (err) {
        console.error(err);
        }
        // file written successfully
    });
    const endTime=Number(new Date());
    console.log("Time take for ",fileName,(endTime-startTime)/1000,'Seconds')
  }
  const dirPath = 'data/diseases';
  const files = fs.readdirSync(dirPath);
  for (let j=0;j<files.length;j++){
    const fileName = files[j];
    if(fileName.endsWith('.json')){
      await writeUpdatedData(fileName);
    }
  }
};

start();
