const app = angular.module('myApp', []);

app.controller('MyController', function($scope, $http) {
  const { createClient } = supabase;

  const SUPABASE_URL = angular.process.env.SUPABASE_URL;
  const SUPABASE_KEY = angular.process.env.SUPABASE_KEY;

  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

  $scope.waiting = false;
  $scope.chatInput = "";
  $scope.items = [];
  const boturl = 'https://grub-robust-positively.ngrok-free.app/webhook/499cb62d-c3a0-4d83-87a1-f3467f7197a3';

  console.log("Hi!");

  const student = "geal";
  const grade = 2;

  $scope.checkEnter = function(event) {
    if (event.which === 13 && $scope.chatInput.trim() !== "") {
      $scope.sendRequest();
    }
  };

  $scope.sendRequest = function() {
  $scope.waiting = true;
  console.log($scope.chatInput);
  $scope.items.push({ sender: 'kamu', text: $scope.chatInput });
  let textinput = $scope.chatInput;
  $scope.chatInput = "";
  
  $http({
    method: 'POST',
    url: boturl,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'LabiraRiset'
    },
    data: {
      chatInput: textinput
    }
  }).then(async function(response) {
    const output = response.data;
    console.log("Response from server:", output);
    $scope.waiting = false;
    const ragArray = JSON.parse(output.output.rag); 
    
    const botResponses = [
      { 
        label: 'FINE TUNED',
        text: output.output.fine_tuned,
        isRelevant: output.output.most_relevant_answer === 'fine_tuned'
      },
      { 
        label: 'RAG',
        text: ragArray[0],
        isRelevant: output.output.most_relevant_answer === 'rag'
      },
      {        
        label: 'RAG WITH FINE TUNED',
        text: output.output.rag_with_fine_tuned,
        isRelevant: output.output.most_relevant_answer === 'rag_with_fine_tuned'
      }
    ];

    console.log("Bot responses:", botResponses);

    $scope.items.push({ 
      sender: 'bot', 
      text: botResponses 
    });

    finaltext = "";

    if(output.output.most_relevant_answer === 'rag'){
      finaltext = ragArray[0]
    } else {
      finaltext = output.output.final_output
    };

    $scope.items.push({
      sender: 'botFinal',
      text: finaltext
    });

    $scope.mostRelevant = output.output.final_output;

    const addData = {
      student: student,
      grade: Number(grade),
      question: textinput,
      answer: output
    }

  const { data, error } = await supabaseClient
          .from('questions_student') 
          .insert([addData]);

        if (error) {
          console.error('Insert error:', error);
        } else {
          console.log('Insert success:', data);
        }

        $scope.$apply(() => {
          $scope.waiting = false;
        });
    });
  };

});
