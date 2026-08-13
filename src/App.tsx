import React, {useState, useEffect} from 'react'

// 

import { Container, Row, Col } from 'react-bootstrap/esm'

// components

import TitleBar from './module/TitleBar/TitleBar'
import TitleModule from './module/TitleModule/TitleModule'
import MyInput from './components/UI/MyInput/MyInput'
import MyButton from './components/UI/MyButton/MyButton'
import ProgressBar from './module/ProgressBar/ProgressBar'
import Credential from './module/Credential/Credential'

// css

import './App.css'

const App = () => {


  const [progress, setProgress] = useState(0)
  const [dataFiles, setDataFiles] = useState<any>({})
  const [convertTitle, setConvertTitle] = useState<string>('')
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    window.electronAPI.onProgress((num: number) => {
      setProgress(num)
    })

    return () => {
      window.electronAPI.removeProgressListener()
    }
  })



  async function getInputfile() {
    try {
      
      const inputData = await window.electronAPI.selectInputFile() as any
      console.log(inputData)

      if (inputData) {
        console.log('Входные данные получены')
        setDataFiles({...dataFiles, input: inputData})
        return
      }

    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        console.error('Ошибка данных файла ', error.message)
      }
      console.error('Неизвестная ошибка ', error)
    }
  }

  async function getOutputFolder () {
    try {
      
      const outputPath = await window.electronAPI.selectOutputFolder() as any
      console.log(outputPath)

      if (outputPath.filePaths) {
        console.log('Выходные данные получены')
        setDataFiles({...dataFiles, output: outputPath.filePaths[0]})
        return
      }

    } catch (error: Error | unknown) {

      if (error instanceof Error) {
        console.error('Ошибка данных папки ', error.message)
      }

      console.error('Неизвестная ошибка ', error)
    }
  }

  async function getAgeInputFolder () {
    try {

      const ageOutputPath = await window.electronAPI.selectInputAgeFolder() as any

      if (ageOutputPath.filePaths) {
        console.log('Выходные данные получены')
        setDataFiles({...dataFiles, age: ageOutputPath.filePaths[0]})
        return
      }
      
    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        console.error('Ошибка данных папки возраста ', error.message)
      }
      console.error('Неизвестная ошибка ', error)
    }
  }

  // 


  async function convertingHandler(data: {input: {path: string, length: number | string}, output: string, age: string}) {
    try {

      const sendToMain = await window.electronAPI.convertFileHandler(data)
      console.log(sendToMain)
      setResult(sendToMain)
      
    } catch (error: Error | unknown) {
      if (error instanceof Error) {
        console.error('Ошибка конвертации ', error.message)
      }
      console.error('Неизвестная ошибка ', error)
    }
  }



  // 


  return (
    <>

    <Col>
      <TitleBar />
    </Col>

    <Container className=' mt-5 vh-100 vw-100'>

        <Row md={12} className='mt-3 mb-4'>
          <Col>
            <TitleModule />
          </Col>
        </Row>

        
        <Row>
          <Col md={12}>
            <MyInput
              title={'Исходный файл'}
              input={(dataFiles.input?.path) ? dataFiles.input?.path : 'TEXT'}
              onClick={() => {
                getInputfile()
              }}
              btn={'Обзор...'} />
          </Col>

          
          {
            (dataFiles.input?.length) && (
              <div>
                <div className='input_info'>Найдено {dataFiles.input?.length}</div>
                <hr/>
              </div>
            )
          }

        </Row>


        <Row>
          <Col md={12}>
            <MyInput
              title={'Выходная папка'}
              input={(dataFiles.output) ? dataFiles.output : 'TEXT'}
              onClick={() => {
                getOutputFolder()
              }}
              btn={'Обзор...'} />
          </Col>
        </Row>

        {/* progress */}

        <Row className='mt-3'>
          <Col>
              <ProgressBar
                title={'Прогресс'}
                progresText={`Конвертация ${progress}`}
                progressValue={progress}
                progressMax={(dataFiles.input?.length) ? Number(dataFiles.input?.length) : 0}
                readbleText={(convertTitle) ? convertTitle : 'Конвертация еще не началась...'}
              />
          </Col>
        </Row>


        {

          (result) && (
            <Row>
              <Col md={12}>
              <div className='input_info_container'>
                <div className='input_info'>{result.message}</div>
                <div className='input_info'>Обработано {result.data}</div>
              </div>
              </Col>
            </Row>
          )

        }
            

        {/*  */}


        <Row className='mt-5'>
          <Col>
              
              <MyButton
                text={'Запустить'}
                onClick={() => {
                  console.log(dataFiles)
                  convertingHandler(dataFiles)
                  setConvertTitle('Конвертация началась')
                }}
              />
          
          </Col>
        </Row>


        <Row className='mt-3'>
          <Col md={12}>
              <Credential
                description={'@ Сделано РУКАМИ а не нейро СКАМОМ'}
                created={'Разработка MetelevNikita'}
              />
          </Col>
        </Row>
    </Container>
    </>
  )
}

export default App