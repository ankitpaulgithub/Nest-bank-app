import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Print from 'expo-print';
import { router } from 'expo-router';
import { Alert } from 'react-native';


const updatePasswordIndex = async () => {
  try {
    const indexStr = await AsyncStorage.getItem('currentPasswordIndex');
    const usageStr = await AsyncStorage.getItem('currentPasswordUsageCount');

    const currentIndex = indexStr ? parseInt(indexStr) : 0;
    const currentUsage = usageStr ? parseInt(usageStr) : 0;

    if (currentUsage < 1) {
      // Increase usage count (0 → 1)
      await AsyncStorage.setItem('currentPasswordUsageCount', (currentUsage + 1).toString());
      console.log(`Password at index ${currentIndex} used ${currentUsage + 1} time(s)`);
    } else {
      // Reset usage count and move to next password
      const newIndex = currentIndex >= 99 ? 0 : currentIndex + 1;
      await AsyncStorage.setItem('currentPasswordIndex', newIndex.toString());
      await AsyncStorage.setItem('currentPasswordUsageCount', '0');
      console.log(`Password index updated to ${newIndex}`);
    }
  } catch (error) {
    console.error('Error updating password index:', error);
  }
};

const generatePDF = async (userData, transaction) => {

  function generateRandomThreeDigit() {
    return Math.floor(100 + Math.random() * 900);
  }
  const randomNumber = await generateRandomThreeDigit();

    const formatAccountNumber = (value) => {
        try {
            if (!value) return '';
            // Remove all spaces first
            const numbers = value.replace(/\s/g, '');
            // Format the number with spaces
            if (numbers.length <= 2) return numbers;
            if (numbers.length <= 6) return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
            if (numbers.length <= 10) return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6)}`;
            if (numbers.length <= 14) return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6, 10)} ${numbers.slice(10)}`;
            if (numbers.length <= 18) return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6, 10)} ${numbers.slice(10, 14)} ${numbers.slice(14)}`;
            if (numbers.length <= 22) return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6, 10)} ${numbers.slice(10, 14)} ${numbers.slice(14, 18)} ${numbers.slice(18)}`;
            return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6, 10)} ${numbers.slice(10, 14)} ${numbers.slice(14, 18)} ${numbers.slice(18, 22)} ${numbers.slice(22, 26)}`;
        } catch (error) {
            console.error('Error formatting account number:', error);
            return value || '';
        }
    };

    const htmlContent = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            font-size: 14px;
            color: #000;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo {
            width: 120px;
            margin-bottom: 10px;
          }
          .section {
            margin: 20px 0;
          }
          .bold {
            font-weight: bold;
            font-size: 16px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          td {
            padding: 6px 8px;
            vertical-align: top;
            font-size: 14px;
          }
          .border-top {
            border-top: 1px solid #000;
            margin-top: 16px;
            padding-top: 8px;
          }
          .footer {
            font-size: 11px;
            color: #444;
            margin-top: 30px;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="data:image/png;base64,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" class="logo" width="200px" alt="Nest Bank"/>
          <h3>POTWIERDZENIE WYKONANIA PRZELEWU - DUPLIKAT</h3>
        </div>
    
        <div class="section">
          Nest Bank<br/>
          Bankowość Detaliczna<br/>
          ul. Wołoska 24, 02-675 Warszawa
        </div>
    
        <div class="section border-top">
          <table>
            <tr>
              <td class="bold">Rachunek:</td>
              <td class="bold">Winien (Nadawca)</td>
              <td class="bold">Rachunek:</td>
              <td class="bold">Ma (Odbiorca)</td>
            </tr>
            <tr>
              <td class="bold">Nr Rachunku:</td>
              <td>${formatAccountNumber(userData?.accountNumber) || "N/A"}</td>
              <td class="bold">Nr Rachunku:</td>
              <td>${formatAccountNumber(transaction?.values?.accountNumber) || "N/A"}</td>
            </tr>
            <tr>
              <td class="bold">Nadawca:</td>
              <td>${userData?.name || "N/A"}</td>
              <td class="bold">Odbiorca:</td>
              <td>
                ${transaction?.values?.recipientName || "N/A"}<br/>
                ${transaction?.values?.recipientAddress || ""}
              </td>
            </tr>
          </table>
        </div>
    
        <div class="section">
          <table>
            <tr>
              <td class="bold">Tytuł operacji:</td>
              <td>${transaction?.values?.transferTitle || "TYTUŁ PRZELEWY"}</td>
            </tr>
            <tr>
              <td class="bold">Rodzaj operacji:</td>
              <td>${transaction?.deliveryType || ""}</td>
            </tr>
            <tr>
              <td class="bold">Nr referencyjny operacji:</td>
              <td>${transaction?.values?.reference || "93293-29322"}</td>
            </tr>
          </table>
        </div>
    
        <div class="section">
          <table>
            <tr>
              <td class="bold">Data operacji:</td>
              <td>${transaction?.date ? new Date(transaction.date).toLocaleDateString('pl-PL') : "N/A"}</td>
            </tr>
            <tr>
              <td class="bold">Data księgowania:</td>
              <td>Następny dzień roboczy</td>
            </tr>
            <tr>
              <td class="bold">Kwota przelewu:</td>
              <td>${transaction?.finalAmount || "N/A"} PLN</td>
            </tr>
          </table>
        </div>
    
        <div class="section">
          <div class="">Data wystawienia dokumentu:${new Date().toISOString().slice(0, 10)}</div>
          
        </div>
    
        <div class="footer">
          Wygenerowane elektronicznie potwierdzenie wykonania przelewu.<br/>
          Dokument sporządzony na podstawie art. 7 Ustawy Prawo Bankowe (Dz.U.Nr 140 z 1997 roku, poz.939 z późniejszymi zmianami).<br/>
          Nie wymaga podpisu ani stempla.
          <br/><br/>
          </div>
          <div class="footer" style="margin-top: 100px; text-align: center;">
          <strong>NESTBANK</strong> Bankowość Detaliczna 
          <br/>
          ul. Wołoska 24, 02-675 Warszawa – NESTBANK.PL<br/>
          Linia Nest Bank: 22 103 18 18
          </div>
      </body>
    </html>
    `;
    

  try {
    console.log('Starting PDF generation...');
    
    // Generate PDF
    const { uri } = await Print.printToFileAsync({ 
      html: htmlContent,
      base64: false
    });
    
    console.log('PDF created at:', uri);

    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error('Generated PDF file does not exist');
    }

    console.log('File info:', fileInfo);

    // Create custom filename with date and transaction details
    const transactionDate = transaction?.date ? new Date(transaction.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    const amount = transaction?.finalAmount || '0';
    const customFileName = `Potwierdzenie-transakcji-nr-${amount}${randomNumber}-z-dnia-${transactionDate}.pdf`;
    
    // Create new path with custom filename
    const newPath = FileSystem.documentDirectory + customFileName;
    
    console.log('Moving file to:', newPath);

    // Move the file to the new location with custom name
    await FileSystem.moveAsync({
      from: uri,
      to: newPath,
    });

    console.log('File moved successfully');

    // Request permissions first
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Permission to access media library is required to save the PDF!');
      return;
    }

    console.log('Permissions granted, creating asset...');

    // Create asset from the renamed file
    const asset = await MediaLibrary.createAssetAsync(newPath);
    console.log('Asset created:', asset);

    // Create album and add asset
    await MediaLibrary.createAlbumAsync('Downloads', asset, false);
    
    Alert.alert('Success', `PDF saved as "${customFileName}" in Downloads folder!`, [
      {
        text: 'OK',
        onPress: () => {
          updatePasswordIndex();
          router.replace('/loadingcreen'); // Any temporary screen
setTimeout(() => {
  router.replace(`/?refresh=${Date.now()}`);
}, 10);
          // router.replace(`/login?refresh=${Date.now()}`);
        }
      }
    ]);
    console.log('PDF saved successfully');

  } catch (error) {
    console.error('Error generating or saving PDF:', error);
    
    // More specific error messages
    if (error.message.includes('Could not create asset')) {
      Alert.alert('Error', 'Could not save PDF. Please check your device storage and try again.');
    } else if (error.message.includes('Permission')) {
      Alert.alert('Permission Error', 'Please grant media library permissions to save PDFs.');
    } else if (error.message.includes('move')) {
      Alert.alert('Error', 'Could not rename PDF file. Please try again.');
    } else {
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }
  }
};

export default generatePDF;
{/* <tr>
              <td class="bold">Nazwa Banku:</td>
              <td>${userData?.bank || "Nest Bank"}</td>
              <td class="bold">Nazwa Banku:</td>
              <td>${transaction?.values?.recipientBank || "N/A"}</td>
            </tr> */}