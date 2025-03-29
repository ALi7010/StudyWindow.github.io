const main_content_prog_bar = document.getElementById("updatePageContent")
let arr_students=[]
const pages_obj={}
const activated_cards=[]
const main_student_card=document.getElementById("studentOverview")
class StudentStreamer{
  constructor(name,stream_hours,status,image_url,views,index){
    this.name=name
    this.stream_hours=stream_hours
    this.status=status
    this.image_url=image_url
    this.views=views
    this.index=index
  }
  createStudent(par_card_elm){
    //image Element
    const icon_student=document.createElement('div');
    const icon_img_student = document.createElement('img')
    icon_img_student.setAttribute("data-lazy-src",this.image_url)
    icon_img_student.setAttribute("loading","lazy")
    icon_img_student.setAttribute("src",this.image_url)
    icon_img_student.setAttribute("class","img-fluid lazy rounded")
    icon_student.setAttribute("class","col-8 icon")
    icon_student.appendChild(icon_img_student);
    //Name Element
    const name_student=document.createElement('div')
    const name_p_student=document.createElement('p')
    const views_p_student=document.createElement('div')
    views_p_student.innerHTML=`
    <p><i class="fa fa-eye"></i>${this.views}</p>
    `
    name_p_student.innerText=this.name
    name_student.setAttribute("class","col")
    name_student.appendChild(name_p_student);
    name_student.appendChild(views_p_student)
    //status
    const status_student=document.createElement('div')
    const status_d_student=document.createElement('div')
    status_d_student.setAttribute('class','status_student rounded-circle')
    status_d_student.setAttribute("id",`dot-${this.index}`)
    status_student.appendChild(status_d_student)
    name_student.appendChild(status_student)
    //hours
    const hours_student=document.createElement('div')
    const hours_p_student=document.createElement('p')
    const hour_24_label=document.createElement('div')
    hour_24_label.setAttribute('class','col')
    const hours_24_hr=document.createElement('p');
    hours_24_hr.setAttribute("class","mt-5 ms-5 mb-0 me-0")
    hours_24_hr.innerText="24:00:00"
    hour_24_label.appendChild(hours_24_hr)
    hours_p_student.setAttribute("id",`t${this.index}`)
    hours_p_student.innerText= timePassedSince(this.stream_hours)
    hours_student.setAttribute("class","col mt-5")
    hours_student.appendChild(hours_p_student)

    //progress
    const daily_progress=document.createElement('div')
    daily_progress.setAttribute("class","progress")
    daily_progress.style.height='5px';
    daily_progress.setAttribute('id',`prog${this.index}`)
    const row_progress=document.createElement("div")
    row_progress.setAttribute("class","mb-3")
    row_progress.appendChild(daily_progress)

    const row_student=document.createElement('div')
    const about_student=document.createElement("div")
    about_student.setAttribute("class","row text-light")
    row_student.setAttribute("class","row text-light")
    row_student.appendChild(icon_student)
    row_student.appendChild(name_student)
    about_student.appendChild(hours_student)
    about_student.appendChild(hour_24_label)
    par_card_elm.appendChild(row_student)
    par_card_elm.appendChild(about_student)
    par_card_elm.appendChild(row_progress)
    return par_card_elm
      }
  updateStudentStatus(){
    const condition = this.status=="is_live"; // Example condition
    const dotElement = document.getElementById(`dot-${this.index}`);
    if (condition) {
        dotElement.classList.add('blinking-red-status_student');
    } else {
        dotElement.classList.remove('blinking-red-status_student');
    }
  }
  UpdateStudentHour(){
    const self=this;
    setInterval(function(){
      let timepassed=timePassedSince(self.stream_hours);
      document.getElementById(`t${self.index}`).innerText=timepassed
      document.getElementById(`prog${self.index}`).innerHTML=`<div  class="progress-bar progress-bar-striped progress-bar-animated bg-danger" role="progressbar" style="width: ${calculateDayPercentage(timepassed)}%" aria-valuenow="${calculateDayPercentage(timepassed)}" aria-valuemin="0" aria-valuemax="100"></div>`
    },1000)
  }
  UpdateConcurrentViewerCount(){

  }
}

function getDataJson(){
  let page_count = 0
  let page_label=""
  let url="https://raw.githubusercontent.com/JamyJones/YtStudy/refs/heads/main/data.json"
  return new Promise((resolve)=>{
    fetch(url,{method:"GET"})
    .then(i=>i.json()).then(function(res){
      let student,name,time,status,icon,views;
      let index=0
      for(let i of Object.keys(res)){
        if(index>0 && index%9==0){ //add nine elements per each page
          page_count+=1
          page_label=`page_${page_count}`
          const new_students_elm_carrier=document.createElement("div")
          new_students_elm_carrier.setAttribute('id',page_label)
          new_students_elm_carrier.setAttribute('class',"card-body bg-dark h-100")
          new_students_elm_carrier.classList.add('hidden')
          main_student_card.appendChild(new_students_elm_carrier)
          pages_obj[page_label]={
            "students":arr_students.slice(),
            "exists_in_dom":false
          }
          arr_students.length=0
        }
        name=res[i]['name']
        time=res[i]['release_timestamp']
        status=res[i]['live_status']
        icon=res[i]['url']
        views=res[i]['concurrent_view_count']
        student= new StudentStreamer(name,time,status,icon,views,index)
        //student.updateStudentStatus();
        //student.UpdateStudentHour();
        arr_students.push(student);
        index+=1;
      }
      if (arr_students.length>0){
        page_count+=1
        page_label=`page_${page_count}`
        pages_obj[page_label]={
            "students":arr_students.slice(),
            "exists_in_dom":false
        }
        pages_obj["length"]=page_count
        arr_students.length=0
        resolve()
      }
    })
}
  )}
async function page_update_time(){
  fetch("https://api.github.com/repos/JamyJones/YtStudy/commits?path=data.json&per_page=1",
    {
      method:"GET",
      headers:
      {
        "Accept": "application/vnd.github+json",
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
  .then(res=>{
    if(!res.ok){
      throw new Error("Network response was not ok")
      alertUser("Check your Internent Connection please! Refresh the page please")
    }
    return res.json();
  })
  .then(async function(data){
    const last_updated_date=new Date(data[0]["commit"]["committer"]["date"])
    const last_updated_date_secs = Math.floor(last_updated_date.getTime()/1000);
    const passedTime= timePassedSince(last_updated_date_secs)
    const [hours,minutes,seconds] = passedTime.split(':').map(Number)
    const wait_time= hours*3600+minutes*60+seconds
    await getDataJson()
    await create_page_numbers()
    displayPageContent(1,document.getElementById('1'))
    updateTimeProgress(wait_time)
  })
  .catch(error =>{
    console.error('There was a problem with the fetch operation:', error);
    alertUser("We are having trouble fetching information from our database, please check that you are not blocking access to endpoint *.github.*, refresh the page please")
  })
}
page_update_time()

function displayPageContent(page_id_index,page){
  const page_id=`page_${page_id_index}`
  let active_card=null
  page.classList.add('active')
  if (pages_obj[page_id]['exists_in_dom']){
    // find it's id which should correspond with page_id
    if(activated_cards.length>0){
       activated_cards[0].classList.add('hidden')
       activated_cards[1].classList.remove('active')
       activated_cards.length=0 //remove all itemes
     }
    active_card = document.getElementById(page_id)
    active_card.classList.remove('hidden')
    activated_cards.push(active_card,page)
  }else{
    // add the contents to the div element and display change the exists_in_dom to true
     if(activated_cards.length>0){
       activated_cards[0].classList.add('hidden')
       activated_cards[1].classList.remove('active')
       activated_cards.length=0
     }
     active_card= document.getElementById(page_id)
    activated_cards.push(active_card,page)
     active_card.classList.remove('hidden')
     pages_obj[page_id]['exists_in_dom']=true
     pages_obj[page_id]['students'].forEach((e)=>{
       e.createStudent(active_card);
       e.updateStudentStatus();
       e.UpdateStudentHour();
   })
  }
}

async function create_page_numbers(){
  return new Promise((resolve)=>{

  const page_numbers_par_elm=document.getElementById('pagination-unit')
  /**
   * subtract 1 from the pages_obj length because there are n_keys+1
   * 1=>length key
   **/
  for (let i=1;i<=pages_obj['length']-1;i++){
    page_numbers_par_elm.innerHTML+=`<li id="${i}" class="page-item"><a class="page-link" onclick="displayPageContent(${i},this)">${i}</a></li>`
  }
    resolve()
})
}

function updateTimeProgress(wait_time){
  let working_wait_time = wait_time
  if (working_wait_time>10*60){
    working_wait_time=10*60 // wait for 10 minutes
  }
  const intervalId = setInterval(function(){
    if (working_wait_time<=10*60 && working_wait_time>=0){
    let tm = 100*working_wait_time/(10*60)
    tm=100-tm
    main_content_prog_bar.setAttribute('aria-valuenow',tm)
    main_content_prog_bar.style.width=`${tm}%`
    working_wait_time-=1
  }else {
    clearInterval(intervalId)
    location.reload(true)
  }
  }
    ,1000)

}
function timePassedSince(timestamp_in_seconds) {
    // Get the current timestamp in seconds

    const currentTime=new Date()
    const currentTimeUTC=new Date(currentTime.toISOString())
    const currentTimestamp = Math.floor(currentTimeUTC.getTime()/1000)
    // Calculate the difference in seconds
    const diffInSeconds = currentTimestamp - timestamp_in_seconds;

    // Convert the difference to hours, minutes, and seconds
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;
    if(hours>=24){
      const days=Math.floor(hours/24)
      const todayMidnight=new Date(currentTimeUTC.setUTCHours(0,0,0,0));
      const todayMidnightSeconds= Math.floor(todayMidnight.getTime()/1000)
      const adjDiffInSeconds = currentTimestamp - todayMidnightSeconds

      const adjHours = Math.floor(adjDiffInSeconds / 3600);
      const adjMinutes = Math.floor((adjDiffInSeconds % 3600) / 60);
      const adjSeconds = adjDiffInSeconds % 60;
      const adjFormattedTime = `${days.toString()} days ,${adjHours.toString().padStart(2, '0')}:${adjMinutes.toString().padStart(2, '0')}:${adjSeconds.toString().padStart(2, '0')}`;
      return adjFormattedTime;
    }
    // Format the results as HH:MM:SS
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return formattedTime;
}
function calculateDayPercentage(parTimeString) {
    let timeString=parTimeString
    const IsdaysInString = parTimeString.search("days")
   if(IsdaysInString!= -1){
     timeString = parTimeString.substring(IsdaysInString+6);
    }
    // Split the time string into hours, minutes, and seconds
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    // Calculate the total seconds that have passed since the start of the day
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    // Total seconds in a full day (24 hours)
    const totalSecondsInDay = 24 * 3600;
    // Calculate the percentage of the day that has passed
    const percentage = (totalSeconds / totalSecondsInDay) * 100;
    return percentage.toFixed(0); // Returning the percentage rounded to 0 decimal places
}

function alertUser(msg){
  document.body.innerHTML+=`
<div class="alert alert-warning alert-dismissible fade show" role="alert">
  ${msg}</strong>.
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
</div>
`
}
