
const arr=[
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z'
]
//https://www.apollopharmacy.in/_next/data/1676650979438/otc.json?label=b

//URL : 'https://search.apollo247.com/fullSearch'
//Type: POST
//{"query":"au","page":1,"productsPerPage":24}

import axios from 'axios';
import fs from 'fs';


function getData(alphaIndex,pageCounter,maxPage,data){
    let url =`https://www.1mg.com/pharmacy_api_gateway/v4/diseases/by_prefix?prefix_term=${arr[alphaIndex]}&page=${pageCounter}&per_page=30`
    console.log(url)
    try{
        axios.get(url).then(function(result){
                        
            if(result && result.data && result.data.data && result.data.data.diseases){
                data=result.data.data.diseases;
                const fileName = `data/diseases/${arr[alphaIndex]}_${pageCounter}.json`
                fs.writeFile(fileName, JSON.stringify(data), err => {
                    if (err) {
                    console.error(err);
                    }else if(alphaIndex<26){
                        
                    }
                    // file written successfully
                });
                const totalPage = result.data.meta.total_pages;
                console.log("Total Page",totalPage,pageCounter)
                if(pageCounter<=totalPage) {
                    setTimeout(function(){
                        getData(alphaIndex,pageCounter+1,totalPage,data)
                    },3000)
                }else{
                    if(alphaIndex<26){
                        getData(alphaIndex+1,1,totalPage,data)
                    }else{
                        console.log("GOT All PAGES")
                    }
                    
                }
                
            }else{
              console.log(url,"No valid result object")  
            }
        }).catch(function(err) {
            console.log(err)
            if(alphaIndex<26){
                getData(alphaIndex+1,1,totalPage,data)          
            }
        })
    }catch(err){
        console.log(err)
        if(alphaIndex<26){
            getData(alphaIndex+1,1,totalPage,data) 
        }
        
    }
    
}


let data=[];
let pageCounter =1;
let maxPage = 250;
let alphaIndex = 0;
getData(alphaIndex,pageCounter,maxPage,data);


