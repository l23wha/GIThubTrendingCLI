
 const args=process.argv.slice(2);


 function getArgValue(flag,defaultValue){
     const index=args.indexOf(flag);

     if(index!==-1 && args[index+1]){
          return args[index+1];
     }

     return defaultValue;
 }

 const duration =getArgValue('--duration', 'week');
 const limit=parseInt(getArgValue('--limit','10'),10);


 //calculate date based on duration

 function getDateFormDuration(dur){
     const date=new Date();
      switch(dur){
          case 'day':
            date.setDate(date.getDate()-1);
            break;
          case 'week':
            date.setDate(date.getDate()-7);
            break;
          case 'month':
                date.setMonth(date.getMonth()-1);
                break
          case 'year':
              date.setFullYear(date.getFullYear()-1);
              break;
          default:
             date.setDate(date.getDate()-7);

      }
      return date.toISOString().split('T')[0];
 }

 const sinceDate=getDateFormDuration(duration);

 async function fetchTrendingRepos() {
     const url=`https://api.github.com/search/repositories?q=created:>${sinceDate}&sort=stars&order=desc`;
     try{
         console.log(`Fetching trending repos for the past ${duration} (since ${sinceDate}...\n)`);

          const response=await fetch(url,{
              headers:{
                  'User-Agent':'github-trending-cli',
                   'Accept':'application/vnd.github.v3+json'
              }
          });

           if(!response.ok){
               if(response.status===403){
                   throw new Error('API rate limit exceeded. Try again later.');
               }
               throw new Error(`Github API error:${response.status} ${response.statusText}`)
           }
           const data=await response.json();
           return data.items.slice(0,limit);
     }catch(error){
          console.error('Error fetching data:', error.message);
          process.exit(1);
     }
 }

 async function main() {
    
      const repos= await fetchTrendingRepos();

       if(repos.length==0){
         console.log('No repositories found for this time range');
       }

       repos.forEach((repo,index)=>{
           console.log(`${index + 1}. **${repo.full_name}**`);
    console.log(`   Description: ${repo.description || 'No description provided'}`);
    console.log(`   Stars: ${repo.stargazers_count.toLocaleString()} |  Language: ${repo.language || 'Not specified'}`);
    console.log(`    URL: ${repo.html_url}`);
    console.log('-'.repeat(60));
       });
 }

 main();