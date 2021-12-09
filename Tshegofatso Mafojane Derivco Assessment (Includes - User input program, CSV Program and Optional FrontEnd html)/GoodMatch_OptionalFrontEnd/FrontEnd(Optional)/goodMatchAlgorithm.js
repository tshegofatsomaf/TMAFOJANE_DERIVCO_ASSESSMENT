//Generates a Match Object containing a compatibility score for two names
function goodMatchAlgorithm(nameOne, nameTwo)
{
	var percentage = "",
		algString = nameOne + " matches " + nameTwo,
		regexString = "",
		regex = new RegExp("[" + regexString + " ]","i");
		
	//Generate the first string of integers for the matching algorithm
	for(var i = 0; i < algString.length; i++)
	{
		var currentChar = algString.charAt(i).toLowerCase();
		if(!currentChar.match(regex))
		{
			var currentCount = 0;
			for(var j = i; j < algString.length; j++)
			{
				if(currentChar == algString.charAt(j).toLowerCase())
				{
					currentCount++;
				}
			}
			percentage = percentage + currentCount;
			//continuously update the regex to ensure characters are not read twice
			regexString = regexString + currentChar;
			regex = new RegExp("[" + regexString + " ]","i");
		}
	}
	
	//This section reduces the string of integers to a 2 digit number
	while(percentage.length > 2)
	{
		var left = 0;
		var right = percentage.length-1;
		var tempPercentage= "";
		var digit;
		while(left < right)
		{
			digit = Number(percentage.charAt(left)) + Number(percentage.charAt(right));
			tempPercentage = tempPercentage + digit;
			left++;
			right--;
		}
		if(left == right)
		{
			tempPercentage = tempPercentage + percentage.charAt(left);
		}
		percentage = tempPercentage;
	}
	
	algString = algString + " " + percentage + "%";
	
	if(Number(percentage) > 80)
	{
		algString = algString + ", good match";
	}
	var names = nameOne + " matches " + nameTwo;
	let matchObj = {playerNames: names, sentence: algString, matchPercentage:Number(percentage)};
	return matchObj;
}

function checkName(name)
{
	var checkString = /[^a-zA-z]/;
	var acceptable = (name != null && name != "");
	if(acceptable)
	{
		acceptable = !checkString.test(name);
	}
	return acceptable;
}

function runAlgorithm()
{
	var nameOne = $("#nameOne").val();
	var nameTwo = $("#nameTwo").val();
	$("#messages").css("display","block");
	if(checkName(nameOne) && checkName(nameTwo))
	{
		$("#error").css("display","none");
		var obj = goodMatchAlgorithm(nameOne, nameTwo);
		$("#result").css("display","block");
		if(obj.matchPercentage > 80)
		{
			$("#match").html(obj.matchPercentage + "%, good match");
		}
		else
		{
			$("#match").html(obj.matchPercentage + "%");	
		}
		
	}
	else
	{
		$("#result").css("display","none");
		$("#error").css("display","block");
		$("#errorMessage").html("Name can only contain Alphabetical characters!");
	}
}
