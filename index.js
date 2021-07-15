var application = angular.module("application", []);

application.controller("controller", 
	
	function($scope, $timeout) {
		
		$scope.submitted = false;
		$scope.alert = {class:"alert-info", message:"الرجاء ادخال رقم الهاتف"};
		$scope.student = new Object();
		
		$timeout(function(){
							
			isValidForm();
		});
		
		$scope.isValidMobile = function(){
			
			return $scope.student.mobile != null 
				&& $scope.student.mobile.length == 8 
				&& ($scope.student.mobile.startsWith("3") 
					|| $scope.student.mobile.startsWith("6"))
		}
		
		$scope.updateMobile = function(){
			
			if($scope.isValidMobile()){
				
				$("#mobile").blur();
				
				$scope.alert = {class:"alert-warning", message:"يرجى الانتظار"};
				
				firebase.database().ref("students").child($scope.student.mobile).once("value").then(function(snapshot){
					
					if(snapshot.val() != null){
						
						$scope.alert = {class:"alert-info", message:"يمكنك تحديث البيانات"};
						
						$scope.student = snapshot.val();
						
					}else {
						
						$scope.alert = {class:"alert-info", message:"يرجى ادخال البيانات"};
						
						$timeout(function(){
							
							$("#name").select();
						});
					}
					
					$scope.$digest();
					
					$timeout(function(){
							
						isValidForm();
					});
				});
			}
		}
		
		$scope.uploadPhoto = function(){
			
			if($("#photo").get(0).files != null 
				&& $("#photo").get(0).files.length != 0){
				
				var reader = new FileReader();
				
				reader.onload = function(e) {
					
					$scope.student.photo = e.target.result;
					
					$scope.$digest();
				};

				reader.readAsDataURL($("#photo").get(0).files[0]);
				
				firebase.storage().ref().child($scope.student.mobile + ".jpg").put($("#photo").get(0).files[0]).then(function(snapshot){
				
					snapshot.ref.getDownloadURL().then(function(url){
							
						$scope.student.photo = url;

						$scope.$digest();
					});
				});
			}
		}
		
		$scope.saveStudent = function(){
			
			window.scrollTo(0, 0);
			
			var result = isValidForm();
			
			if(result == null){
				
				$scope.alert = {class:"alert-warning", message:"يرجى الانتظار"};
				
				$scope.submitted = true;
				
				firebase.database().ref("students").child($scope.student.mobile).set($scope.student).then(function(){
					
					$scope.alert = {class:"alert-success", message:"تم حفظ معلومات الطالب بنجاح"};
					
					$scope.$digest();
					
				}).catch(function(error){
					
					$scope.submitted = false;
					
					$scope.alert = {class:"alert-danger", message:error};
					
					$scope.$digest();
				});
					
			}else{
				
				$scope.alert = {class:"alert-danger", message:result};
			}
		}
	}
);