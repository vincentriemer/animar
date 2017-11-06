pipeline {
  agent none
  stages {
    stage('Build') {
      agent {
        docker {
          image 'node'
        }
        
      }
      steps {
        sh 'npm install'
        sh 'npm run build'
      }
    }
  }
}