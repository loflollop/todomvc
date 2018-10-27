(function (window,Vue,undefined) {
//1.先要找到一个数组
//    1-1 先暂时自己创造一个数组
//2.当数组发生改变就再次存储回localStorage里面
//	  2-1只要数组改变就触发存储的行为
//    2-2 watch 深度监听
//3.自定义一个指令
//    3-1自动获取光标
//4.添加一条数据
//    4-1向数组的末尾追加一个对象
//    4-2出现一个这样的对象    data数据中==>newTodo:''
//    4-3 content: input 输入的内容
//    4-4 isFinish:false
//    4-5 id:先排序（按照id的大小），拿最后一个的id  去+1
//5.删除一个 todo 
//    5-1  应该是使用id
//    5-2  渲染按照索引渲染
//    5-3  视图和数据是配套的   0->1   1->2
//    5-4  可以直接根据索引来删除
//6.计算所有 isFinish 为 false 的数量
//7.让全部删除按钮显示和隐藏
//    7-1  如果 activeNum === dataList.length说明都是 false 应该隐藏
//    7-2  如果不一致，就应该显示出来
//8.全部删除
//    8-1  删除的是，isFinish 为 true 的所有项
//    8-2  剩余的是，isFinish 为 false 的所有项
//    8-3  把所有 isFinish 为 false 的筛选出来重新赋值给 dataList
//9.全选
//    9-1 使用计算属性，配合 every 方法计算出一个值，true 或者 false
//    9-2 使用 v-model 绑定到 全选按钮上
//    9-3 当点击这个全选按钮的时候触发改变的行为，让数组中每一个选项的isFinish 属性等于改变后的值
//    9-4 会导致计算属性的值计算项改变而重新计算，得到一个新的值
//10.显示编辑文本框
//    10-1 在双击的时候，让所有的 li 取消 editing 类名
//          捕获所有的 li
//          ref 类似于class
//          $refs 不管在哪个位置执行，都能得到页面中所有 ref 属性的元素
//    10-2 让当前这个 li 添加 editing 类名（由index决定）
//         使用$refs 获取所有的li,让每一个li 移出一个 editing 类名
//         使用$refs 让当前的li 添加 editing 类名
//    10-3 在编辑之前拷贝一份内容出来
//         JSON.parse(JSON.stringify(对象))
//11.真正编辑的时候
//    11-1 回车事件，需要传递 index
//    11-2 判断是否为空，根据 index 去删除当前想
//    11-3 判断和备份那个内容是否改变，改变了就把isFinish 变成false 
//    11-4 让当前这个 li 把 editing 类名移出
//    11-5 清空备份 
//12.还原内容，点击ESC 的时候
//    12-1 注册 esc 的键盘事件
//    12-2 把数组中当前想的内容变成  之前备份里面的内容
//    12-3 让当前这个 li 把 editing 类名移出
//    12-4 清空备份 

var list = [
	{
		id:1,
		content:'abc',
		isFinish:true
	},
	{
		id:2,
		content:'abc',
		isFinish:false
	},
	{
		id:3,
		content:'abc',
		isFinish:true
	}
]
new Vue({
	el:'#app',
	data:{
		//数据是在localStorage 里面存储的
		//拿出来的时候是个字符串 json 格式
		//使用json.parse解析
		dataList:JSON.parse(window.localStorage.getItem('dataList')) || [{id:1,content:'abc',isFinish:true}],
		newTodo:'',
		beforeUpdate: {}
	},
	methods:{
		//添加一个todo
		addTodo(){
			//判断内容不能为空
			if(!this.newTodo.trim){
				return
			}
			// console.log('触发');
			//组装一个对象，把对象添加到数组里面
			this.dataList.push({
				content:this.newTodo.trim(),
				isFinish:false,
				id:this.dataList.length ? this.dataList.sort((a,b)=>a.id-b.id)[this.dataList.length-1]['id']+1:1//三元运算
			})
			this.newTodo =''//删除后清空
		},
		//删除一个 todo
		delTodo(index){
			this.dataList.splice(index,1)
		},
		//删除所有已经完成 todo
		delAll(){
			this.dataList = this.dataList.filter(item => !item.isFinish)
		},
		//让当前li 添加 editing 类名
		//显示编辑的文本框
		showEdit (index) {
			// console.log(index);
			// console.log(this.$refs);
			this.$refs.show.forEach(item => {
				item.classList.remove('editing')
			})
			this.$refs.show[index].classList.add('editing')
			this.beforeUpdate = JSON.parse(JSON.stringify(this.dataList[index]))
		},
		//真正的编辑事件
		updateTodo(index) {
			if(!this.dataList[index].content.trim()) return this.dataList.splice(index,1)
			if(this.dataList[index].content !==this.beforeUpdate.content) this.dataList[index].isFinish =false
			this.$refs.show[index].classList.remove('editing')
			this.beforeUpdate = {}	
		},
		//还原内容
		backTodo (index) {
			this.dataList[index].content = this.beforeUpdate.content
			this.$refs.show[index].classList.remove('editing')
			this.beforeUpdate = {}
		},
	},
	//监听 ==>dataList  
	watch:{
		dataList:{
			handler(newArr){
				window.localStorage.setItem('dataList',JSON.stringify(newArr))
			},
			deep:true
		}
	},
	//计算属性
	computed:{
		activeNum(){
			return this.dataList.filter(item=>!item.isFinish).length
		},
		toggleAll:{
			get(){
				//判断是不是每一个都是true，如果每一个都是true，return true
				//只要有一个不是true ，return false
				return this.dataList.every(item => item.isFinish)
			},
			// 设置计算属性
			// 只能捕获到要改变的行为
			// 在改变的这个行为里面去触发被计算项，当前这个值重新计算
			set(val){
				//已经触发了改变这个行为
				//让dataList里面的每一项发生变化
				this.dataList.forEach(item => item.isFinish = val)
			}
		}
	},
	//自定义指令
	directives: {
		focus:{
			inserted(el){
				el.focus()
			}
		}
	}
})	
})(window,Vue);
