import csv from 'csv-parser';
import fs from 'fs';

//Generates the compatibility percentage by manipulating the input strings
function goodMatchAlgorithm(nameOne, nameTwo)
{
	var percentage = "",
		algString = nameOne + " matches " + nameTwo,
		regexString = "",
		regex = new RegExp("[" + regexString + " ]","i");
		
	//This section generates the first string of integers for the matching algorithm
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

//Validation function for name input
function checkName(name)
{
	var checkString = /[^a-zA-z]/;
	var acceptable = (name != null && name != "");
	if(!acceptable)
	{
	 	writeToLog("Input excluded: The name entered was either null or empty!(" + name + ")", 1);
	}
	else
	{
		acceptable = !checkString.test(name);
		if(!acceptable)
		{
			writeToLog("Input excluded: The name entered contains non-alphabetical characters!(" + name + ")" , 1);
		}
	}
	return acceptable;
}

//Validation function for row information from the csv file
function isValidInput(name, gender)
{
	if(gender != "f" && gender !="m")
	{
		writeToLog("Input excluded: invalid gender", 1);
		return false;
	}
	return checkName(name);
}

//Outputs results to a textfile
function writeResultsToFile(results, option)
{
	var result = "Results:\n\n";

	if(option == 1)
	{
		result = "Reversed Set Results:\n\n"
	}
	else if(option == 2)
	{
		result = "Combination Set Results:\n\n"
	}

	for(var i = 0; i < results.length; i++)
	{
		result = result + results[i].sentence + "\n";
	}
	result = result + "\n\n";

	if(option == 0)
	{
		fs.writeFile("output.txt", result, function(err){
			if(err)
			{
				writeToLog("Could not write the results to file.", 1);
			}
		});
	}
	else
	{
		fs.appendFile("output.txt", result, function(err){
			if(err)
			{
				writeToLog("Could not write the results to file.", 1);
			}
		});
	}
}

//Helper function to sort array of objects in descending order based on the match percentage attribute
function sortArray(array)
{
	//Order the results based on percentage then alphabetically
	for(var i = 0; i < array.length; i++)
	{
		for(var j = i; j < array.length; j++)
		{
			if(array[i].matchPercentage < array[j].matchPercentage)
			{
				var temp = array[i];
				array[i] = array[j];
				array[j] = temp;
			}
			if(array[i].matchPercentage == array[j].matchPercentage)
			{
				if(array[i].playerNames.toLowerCase() > array[j].playerNames.toLowerCase())
				{
					var temp = array[i];
					array[i] = array[j];
					array[j] = temp;
				}
			}
		}
	}
	return array;
}

//Helper function to ensure no duplicate names are entered
function checkIfNameExists(array,name)
{
	for(var i = 0; i < array.length; i++)
	{
		if(array[i].toLowerCase() == name.toLowerCase())
		{
			return true;
		}
	}
	return false;
}

//Function to append to the log file
function writeToLog(message, num)
{
	var logMessage;
	if(num == 0)
	{
		var d = new Date();
		var date = "[" + d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear() + "]"; 
		var time = "[" + d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds() + "]";
		logMessage = date + time + "\n\t\t" + message + "\n";
	}
	else
	{
		logMessage = "\t\t" + message + "\n";
	}
	fs.appendFile("logs.txt", logMessage, function(err)
	{
		if(err)
		{
			console.log("Could not write to the log file.");
		}
	});
}

//Takes in a filename and reads a csv file. Calls the good match algorithm and validates inputs from the file.
function main() 
{
	if(process.argv.length < 3)
	{
		console.log("Please input the CSV file name as a parameter.");
		console.log("e.g. node goodMatch.js examplefile.csv");
		writeToLog("Run without required parameter. Exiting.\n",1);
	}
	else if(process.argv.length > 3)
	{
		console.log("Please input only the CSV file name as a parameter. You have too many arguments");
		console.log("e.g. node goodMatch.js examplefile.csv");
		writeToLog("Run with too many parameters. Exiting.\n",1);
	}
	else if(process.argv[2].split('.').length != 2 || process.argv[2].split('.')[1] != "csv")
	{
		console.log("Please input only the CSV file name as a parameter. Incorrect file type");
		console.log("e.g. node goodMatch.js examplefile.csv");
		writeToLog("Run with incorrect file type. Exiting.\n",1);
	}
	else
	{
		var filename = process.argv[2];
		
		var male = [];
		var female = [];
		
		var keyError = false;

		fs.createReadStream(filename)
			.on('error', function(e) {
				console.log("Invalid Argument.");
				console.log("\tPlease ensure that you input the file name correctly.");
				console.log("\tPlease ensure that you input a .csv file.");
				console.log("\tPlease ensure that the csv file is in the same directory\n\t as goodMatch.js OR enter the csv file's full File Path.");
				writeToLog("Filename Parameter does not exists. Exiting.\n",1);
			})
			.pipe(csv())
			.on('data',(row) => {
				var keys = [];
				for(var key in row)
				{			
					if(Object.prototype.hasOwnProperty.call(row, key))
					{
						keys.push(key);
					}
				}
				if(keys.length == 2)
				{
					var gender = row[keys[1]].trim().toLowerCase();
					var name = row[keys[0]];
					var valid = isValidInput(name, gender);
					if(valid)
					{
						if(gender == "m")
						{
							if(!checkIfNameExists(male,name))
							{
								male.push(name);
							}
						}
						else
						{
							if(!checkIfNameExists(female, name))
							{
								female.push(name);
							}
						}
					}
				}
				else
				{
					keyError = true;
				}
			})
			.on('end', () => {
				if(!keyError)
				{
					var result = [];
					var reverseResult = [];
					var combinationResult = [];
					for(var i = 0; i < male.length; i++)
					{
						for(var j = 0; j < female.length; j++)
						{
							var matchObj = goodMatchAlgorithm(male[i],female[j]);
							var reverseMatchObj = goodMatchAlgorithm(female[j],male[i]);
							result.push(matchObj);
							reverseResult.push(reverseMatchObj);
							var combinationMatchObj = {playerNames: matchObj.playerNames, sentence: matchObj.sentence, matchPercentage:(Number(matchObj.matchPercentage) + Number(reverseMatchObj.matchPercentage)) / 2};
							combinationMatchObj.sentence = combinationMatchObj.playerNames + " " + combinationMatchObj.matchPercentage + "%";
							if(combinationMatchObj.matchPercentage > 80)
							{
								combinationMatchObj.sentence = combinationMatchObj.sentence + ", good match";
							}
							combinationResult.push(combinationMatchObj);
						}
					}
					sortArray(result);
					sortArray(reverseResult);
					sortArray(combinationResult);
					
					//Print results to a textfile
					writeResultsToFile(result, 0);
					writeResultsToFile(reverseResult, 1);
					writeResultsToFile(combinationResult, 2);
				}
				else
				{
					console.log("File Format incorrect.");
					console.log("The first line must be exactly two values seperated by a comma");
					console.log("Please ensure first line has the following format: ");
					console.log("name,gender");
					writeToLog("Incorrect File Format", 1);
				}	
				var totalExecutionTime = new Date() - startDate;
				writeToLog("Total Execution Time(" + totalExecutionTime + "ms)\n", 1);		
			});
	}
}

var startDate = new Date();

writeToLog("Begin execution", 0);
main();

