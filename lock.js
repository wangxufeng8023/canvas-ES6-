class Lock{
        constructor(title,pencilcolor){ 

           this.pencilcolor = pencilcolor
           this.title = title
          this.rendering(this.title);
    
            }
 
                  // 初始化解锁密码面板
        drawCircle (x, y) { 
            let self = this;
            //strokeStyle 设置画笔的颜色。
            self.sender.strokeStyle = self.pencilcolor;
            //设置线条的宽度
            self.sender.lineWidth = 2;
            //起始一条新路径
            self.sender.beginPath();
            //画出点
            self.sender.arc(x, y, self.r, 0, Math.PI * 2, false);
            self.sender.closePath();
            //绘制解锁图案
            self.sender.stroke();
          }
          //画点，就是在我们选中一个点的时候执行这个函数
        drawPoint () { 
            let self = this;
            for (let i = 0 ; i < self.reactPoint.length ; i++) {
               //填充色，fillstyle
                self.sender.fillStyle = '#CFE6FF';
                self.sender.beginPath();
                self.sender.arc(self.reactPoint[i].x, self.reactPoint[i].y, self.r / 2, 0, Math.PI * 2, true);
                self.sender.closePath();
                //填充
                self.sender.fill();
              }
          }
        // 初始化状态线条
        createPoint (type) { 
            let self = this;
            for (let i = 0 ; i < self.reactPoint.length ; i++) {
                self.sender.strokeStyle = type;
                self.sender.beginPath();
                self.sender.arc(self.reactPoint[i].x, self.reactPoint[i].y, self.r, 0, Math.PI * 2, true);
                self.sender.closePath();
                self.sender.stroke();
            }
        }//画出解锁的轨迹线。
        drawLine (po, reactPoint) {
            let self = this;
            self.sender.beginPath();
            //线的粗细，
            self.sender.lineWidth = 3;
            self.sender.moveTo(self.reactPoint[0].x, self.reactPoint[0].y);
            
            for (let i = 1 ; i < self.reactPoint.length ; i++) {
                self.sender.lineTo(self.reactPoint[i].x, self.reactPoint[i].y);
            }
            self.sender.lineTo(po.x, po.y);
            self.sender.stroke();
            self.sender.closePath();
 
          }
           // 创建解锁点的坐标，根据canvas的大小来平均分配半径
        createCircle () {
            let self = this;
            let [n,count] = [3,0];
          
            self.r = self.sender.canvas.width / 14;// 公式计算
            self.reactPoint = [];
            self.array = [];
            self.modPoint = [];
            let r = self.r;
            for (let i = 0 ; i < n ; i++) {
                for (let j = 0 ; j < n ; j++) {
                    count++;
                    let obj = {
                        x: (j * 4 + 3 )* r,
                        y: (i * 4 + 3 ) *r,
                        index: count
                    };
                    self.array.push(obj);
                    self.modPoint.push(obj);
                }
            }
            self.sender.clearRect(0, 0, self.sender.canvas.width, self.sender.canvas.height);
            for (let i = 0 ; i < self.array.length ; i++) {
                self.drawCircle(self.array[i].x, self.array[i].y);
            }
            //return array;
         }
         // 获取touch点相对于canvas的坐标
        getPosition (event) {

            //Target和currentTarget(),getBoundingClientRect()获的钙元素的left，top，属性；
            let events =event||window.event;
            let rect = events.currentTarget.getBoundingClientRect();
            let point = {
                x: events.touches[0].clientX - rect.left,
                y: events.touches[0].clientY - rect.top
              };
            return point;
        }
         // 核心变换方法在touchmove时候调用
        process (point) {
            let self = this;
            self.sender.clearRect(0, 0, self.sender.canvas.width, self.sender.canvas.height);
 
            for (let i = 0 ; i < self.array.length ; i++) { // 每帧先把面板画出来
                self.drawCircle(self.array[i].x, self.array[i].y);
            }
 
            self.drawPoint(self.reactPoint);// 每帧花轨迹
            self.drawLine(point , self.reactPoint);// 每帧画圆心
 
            for (let i = 0 ; i < self.modPoint.length ; i++) {
                if (Math.abs(point.x - self.modPoint[i].x) < self.r && Math.abs(point.y - self.modPoint[i].y) < self.r) {
                    self.drawPoint(self.modPoint[i].x, self.modPoint[i].y);
                    self.reactPoint.push(self.modPoint[i]);
                    self.modPoint.splice(i, 1);
                    break;
                }
            }
 
         }
        // 检查两次输入的密码是否一致
        testPass(pw1,pw2){
            
            let c = Array.from(pw1,x=>''+x[0]+x[1]);
            let d = Array.from(pw2,x=>''+x[0]+x[1]);
            return c.join()===d.join();



        }
        // touchend结束之后对密码和状态的处理
        keppPass (pasw) {
            let self = this;
            if (Lock.flag==false) {
            
                if(Lock.start==undefined || self.statu.mark!=2){
                    document.getElementById('title').innerHTML = '请您先设置密码';
                    delete self.statu.mark; 

                   }
                else if (self.testPass(self.statu.spassword, pasw)) {
                    document.getElementById('title').innerHTML = '密码正确';
                    self.createPoint('#00FFFF');
                     } 
                else {
                    self.createPoint('red');
                    document.getElementById('title').innerHTML = '输入的密码不正确';
                }

                 }
            else if(Lock.flag==true&&self.statu.mark==1){
     
                if (self.testPass(self.statu.fpassword, pasw)) {
                    self.statu.mark = 2;
                    self.statu.spassword = pasw;
                    document.getElementById('title').innerHTML = '密码设置成功';
                    self.createPoint('#00FFFF');
                    window.localStorage.setItem('passwordxx', JSON.stringify(self.statu.spassword));
                    
                } 
                else {
                    document.getElementById('title').innerHTML = '两次输入的不一致';
                    self.createPoint('red');
                    delete self.statu.mark;
                }



              }

            else {
                self.statu.mark = 1;
                if(pasw.length<4){
                    document.getElementById('title').innerHTML = '密码太短，至少需要4个点';
                    self.createPoint('red');
                    delete self.statu.mark;
                  }
                else{
                        self.statu.fpassword = pasw;
                        document.getElementById('title').innerHTML = '请再次输入手势密码';
                    }
                }
              }
            
      
       //渲染模板和初始化    
        
        rendering (title) {
            let self = this;
            let content = document.createElement('div');
            let subs = '<h4 style="color:white;margin: 35px auto;">'+title+'</h4>'+
                      
                    '<canvas id="canvas" width="300" height="300" style="position:absolute;top:120px;left:40px;display: inline-block;margin-top: 15px;"></canvas>'+'<p id="title" class="title" style="margin:385px auto;width:200px;align:center;"></p>'+'<div style="position:absolute; left:25px;top:480px;">'+'<input type="radio" id="setPassword" onclick="Lock.set(this);" value="设置密码" name="choose" />'+
                    '<label for="setPassword">设置密码</label>'+'<br/>'+
                    '<input type="radio" value="验证密码" id="testPassword" name="choose" onclick="Lock.set(this);" />'+
                    '<label for="testPassword">验证密码</label>'+'</div>';
            content.setAttribute('style','position: absolute;top:0;left:0;right:0;bottom:0;');
            content.innerHTML = subs;
            document.body.appendChild(content);

            
            
            self.statu ={};
            self.reactPoint = [];
           
            self.touchPress = false;
            self.canvas = document.getElementById('canvas');
            self.sender = self.canvas.getContext('2d');
            self.createCircle();
            self.eventHandler();

        
          }
        //获取用户的状态 1设置密码 2.验证密码   
     
        static set(e) {

            if(e.value=="设置密码"){
                let test=document.getElementById("testPassword");
                test.removeAttribute("checked");
                Lock.start = true;
                Lock.flag=true;
                
            }
            else{
                let set=document.getElementById("setPassword");
                set.removeAttribute("checked");
                
                Lock.flag=false;

                
               
                 }

           }  
        eventHandler () {
            let self = this;
            self.addHandler(self.canvas,"touchstart", function (e) {
            e.preventDefault();// 某些android 的 touchmove不宜触发 所以增加此行代码
            let point = self.getPosition(e);
            for (let i = 0 ; i < self.array.length ; i++) {
                if (Math.abs(point.x - self.array[i].x) < self.r && Math.abs(point.y - self.array[i].y) < self.r) {
 
                    self.touchPress = true;
                    self.drawPoint(self.array[i].x,self.array[i].y);
                    self.reactPoint.push(self.array[i]);
                    //将modPoint()中的第i个点删除;
                    self.modPoint.splice(i,1);
                        break;
                    }
                 }
             });
             self.addHandler(self.canvas,"touchmove", function (e) {
                if (self.touchPress) {
                    self.process(self.getPosition(e));
                }
             });
            self.addHandler( self.canvas,"touchend", function (e) {
                 if (self.touchPress) {
                     self.touchPress = false;
                     self.keppPass(self.reactPoint);
                     setTimeout(function(){
 
                        self.createCircle();
                    }, 200);
                 }
 
 
             });
           self.addHandler( document,'touchmove', function(e){
                e.preventDefault();
             });
             
            }
        //屏蔽浏览器的差异化
        addHandler(element,type,handler){
                if(element.addEventListener){
                  element.addEventListener(type,handler,false);
                }
                else if(element.attachEvent){
                    element.attachEvent("on"+type,handler);
                    }
                else {
                    element["on"+type] = handler;
                }
            }
}

  