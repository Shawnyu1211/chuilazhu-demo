// index.js
// 获取应用实例
const app = getApp()

const recorderManager = wx.getRecorderManager()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  startRecord(e) {
    recorderManager.onStart(() => {
      console.log('recorder start')
    })
    recorderManager.onPause(() => {
      console.log('recorder pause')
    })
    recorderManager.onStop((res) => {
      console.log('recorder stop', res)
      const { tempFilePath } = res

      if (res.tempFilePath.indexOf("http:") == 0) {
        wx.request({
          url: res.tempFilePath, // 音频 url
          responseType: 'arraybuffer',
          success: (res) => {
            console.log(res.data)
            const audioCtx = wx.createWebAudioContext()
            audioCtx.decodeAudioData(res.data, buffer => {
              console.log(buffer)
              var pcmArr = buffer.getChannelData(0)
              var max = 0.00
              for (var i = 0; i < pcmArr.length;i++) {
                if (pcmArr.indexOf(i) * 1000 > max) {
                  max = pcmArr.indexOf(i) * 1000
                }
              }
  
              if (max > 0.3) {
                console.log("吹了")
              } else {
                console.log("没吹")
              }
  
            }, err => {
              console.error('decodeAudioData fail', err)
            })
          }
        })
      } else {
        var fs = wx.getFileSystemManager()
        fs.readFile({
          filePath: res.tempFilePath,
          success(res) {
            console.log(res.data)
            const audioCtx = wx.createWebAudioContext()
            audioCtx.decodeAudioData(res.data, buffer => {
              console.log(buffer)
              var pcmArr = buffer.getChannelData(0)
              var max = 0.00
              for (var i = 0; i < pcmArr.length;i++) {
                if (pcmArr.indexOf(i) * 1000 > max) {
                  max = pcmArr.indexOf(i) * 1000
                }
              }
  
              if (max > 0.3) {
                console.log("吹了")
              } else {
                console.log("没吹")
              }
  
            }, err => {
              console.error('decodeAudioData fail', err)
            })
          },
          fail(res) {
            console.error(res)
          }
        })
      }
      
    })
    recorderManager.onFrameRecorded((res) => {
      const { frameBuffer } = res
      console.log('frameBuffer.byteLength', frameBuffer.byteLength)
    })
    
    const options = {
      duration: 60000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'aac',
      frameSize: 50
    }
    
    recorderManager.start(options)
  },

  stopRecord(e) {
    recorderManager.stop()
  }
})
