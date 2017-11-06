pipeline {
  agent none
  stages {
    stage('Build') {
      agent {
        docker {
          image 'node'
          args '8'
        }
        
      }
      steps {
        sh 'npm install'
        sh 'npm run build'
      }
    }
  }
}